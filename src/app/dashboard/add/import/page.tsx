'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useLang } from '@/components/lang-provider'
import { ChevronLeft, FileUp, AlertCircle, CheckCircle, UploadCloud, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'

type Step = 'UPLOAD' | 'MAPPING'
type Mapping = {
    first_name: string
    last_name: string
    nickname: string
}

export default function ImportPlayersPage() {
    const { t } = useLang()
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState<Step>('UPLOAD')
    const [file, setFile] = useState<File | null>(null)
    const [csvHeaders, setCsvHeaders] = useState<string[]>([])
    const [csvData, setCsvData] = useState<any[]>([])

    const [mapping, setMapping] = useState<Mapping>({
        first_name: '',
        last_name: '',
        nickname: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setError(null)
            setSuccess(null)
            setStep('UPLOAD')
        }
    }

    const startMapping = () => {
        if (!file) {
            setError(t.add.error || "No file selected.")
            return
        }

        setError(null)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.meta.fields && results.meta.fields.length > 0) {
                    setCsvHeaders(results.meta.fields)
                    setCsvData(results.data)

                    // Auto-mapping by trying to guess common column names
                    const headersLower = results.meta.fields.map(h => h.toLowerCase())
                    const newMapping = { first_name: '', last_name: '', nickname: '' }

                    const fnIndex = headersLower.findIndex(h => h.includes('nombre') || h.includes('first'))
                    if (fnIndex !== -1) newMapping.first_name = results.meta.fields[fnIndex]

                    const lnIndex = headersLower.findIndex(h => h.includes('apellido') || h.includes('last'))
                    if (lnIndex !== -1) newMapping.last_name = results.meta.fields[lnIndex]

                    const nkIndex = headersLower.findIndex(h => h.includes('apodo') || h.includes('nick'))
                    if (nkIndex !== -1) newMapping.nickname = results.meta.fields[nkIndex]

                    setMapping(newMapping)
                    setStep('MAPPING')
                } else {
                    setError("El archivo parece estar vacío o no tiene encabezados válidos.")
                }
            },
            error: (parseError) => {
                console.error(parseError)
                setError("Error leyendo el archivo CSV. Asegúrate de que sea un archivo de texto válido.")
            }
        })
    }

    const handleImport = async () => {
        if (!mapping.first_name || !mapping.last_name) {
            setError("Debes seleccionar obligatoriamente las columnas de Nombre y Apellido.")
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(null)

        const validPlayers = csvData.filter(row => {
            const fn = row[mapping.first_name]
            const ln = row[mapping.last_name]
            return fn && typeof fn === 'string' && fn.trim() !== '' && ln && typeof ln === 'string' && ln.trim() !== ''
        })

        if (validPlayers.length === 0) {
            setError("No se encontraron jugadores válidos con el mapeo seleccionado.")
            setLoading(false)
            return
        }

        const inserts = validPlayers.map(row => ({
            first_name: row[mapping.first_name].trim(),
            last_name: row[mapping.last_name].trim(),
            nickname: mapping.nickname && row[mapping.nickname] ? row[mapping.nickname].trim() : null
        }))

        const { error: insertError } = await supabase
            .from('players')
            .insert(inserts)

        setLoading(false)

        if (insertError) {
            console.error(insertError)
            if (insertError.code === '23505') {
                setError("Error: El archivo contiene jugadores que ya existen en la base de datos (mismo nombre, apellido y apodo).")
            } else {
                setError("Error volcando datos en la base: " + insertError.message)
            }
        } else {
            setSuccess(`¡Éxito! Se importaron ${validPlayers.length} jugadores al plantel.`)
            setTimeout(() => {
                router.push('/dashboard/players')
            }, 2500)
        }
    }

    // A helper to quickly render the map combo box
    const renderSelect = (systemKey: keyof Mapping, label: string, isRequired: boolean) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-[#0B1526]/50 rounded-xl border border-gray-200 dark:border-white/10 gap-4">
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {label}
                    {isRequired ? (
                        <span className="text-[10px] bg-liceo-primary/10 text-liceo-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t.add.mappingRequired}</span>
                    ) : (
                        <span className="text-[10px] bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t.add.mappingOptional}</span>
                    )}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.add.sysField}</p>
            </div>

            <div className="flex-1 w-full md:w-auto">
                <select
                    value={mapping[systemKey]}
                    onChange={(e) => setMapping({ ...mapping, [systemKey]: e.target.value })}
                    className={`w-full px-3 py-2.5 bg-white dark:bg-[#001224] border ${!mapping[systemKey] && isRequired ? 'border-red-300 dark:border-red-500/50' : 'border-gray-200 dark:border-white/20'} rounded-lg text-sm focus:ring-2 focus:ring-liceo-accent outline-none font-medium dark:text-white`}
                >
                    <option value="">{t.add.selectColumn}</option>
                    {csvHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
            </div>
        </div>
    )

    return (
        <div className="p-6 md:p-10 min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-liceo-primary/30 via-background to-background dark:from-liceo-primary/20 dark:via-background dark:to-background text-foreground transition-colors flex flex-col items-center">

            <div className="w-full max-w-2xl">
                {/* Back button */}
                <Link href="/dashboard/players" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-liceo-primary dark:text-gray-400 dark:hover:text-liceo-gold transition-colors mb-6 group">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    {t.add.back}
                </Link>

                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl rounded-3xl p-6 md:p-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-liceo-primary to-liceo-accent flex items-center justify-center text-white shadow-lg">
                            <FileUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {step === 'UPLOAD' ? t.add.importTitle : t.add.mappingTitle}
                            </h1>
                        </div>
                    </div>

                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                        {step === 'UPLOAD' ? t.add.importSubtitle : t.add.mappingSubtitle}
                        {step === 'UPLOAD' && (
                            <>
                                <br />
                                <span className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded inline-block mt-2 text-gray-700 dark:text-gray-300">
                                    {t.add.importInfo}
                                </span>
                            </>
                        )}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400 leading-relaxed">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-bold">{success}</p>
                        </div>
                    )}

                    {step === 'UPLOAD' && (
                        <div className="space-y-6 flex flex-col items-center border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl p-8 bg-gray-50/50 dark:bg-[#0B1526]/50 transition-all hover:bg-gray-50 hover:dark:bg-[#0B1526]/80 text-center">
                            <UploadCloud className="w-12 h-12 text-liceo-accent dark:text-liceo-gold mb-2 opacity-80" />
                            <div className="space-y-1 relative">
                                <label htmlFor="csv-upload" className="block text-sm font-extrabold text-liceo-primary dark:text-liceo-gold hover:underline cursor-pointer">
                                    {file ? file.name : t.add.selectFile}
                                </label>
                                <input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0]"
                                />
                                {!file && <p className="text-xs text-gray-400 font-medium">Solo archivos .CSV</p>}
                            </div>

                            {file && (
                                <button
                                    onClick={startMapping}
                                    className="mt-4 px-8 py-3.5 w-full bg-liceo-primary hover:bg-liceo-primary/90 dark:bg-liceo-gold dark:hover:bg-yellow-400 rounded-xl shadow-lg dark:shadow-[0_4px_20px_rgba(255,217,0,0.3)] flex items-center justify-center gap-2 transition-all font-bold text-sm text-white dark:text-[#0B1526]"
                                >
                                    {t.add.uploadBtn} <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            )}
                        </div>
                    )}

                    {step === 'MAPPING' && (
                        <div className="space-y-4">

                            <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl mb-6">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                    Archivo detectado: <span className="text-liceo-primary dark:text-liceo-gold">{file?.name}</span> ({csvData.length} jugadores encontrados)
                                </p>
                            </div>

                            {renderSelect('first_name', t.add.firstName, true)}
                            {renderSelect('last_name', t.add.lastName, true)}
                            {renderSelect('nickname', t.add.nickname, false)}

                            <button
                                onClick={handleImport}
                                disabled={loading || success !== null || !mapping.first_name || !mapping.last_name}
                                className="mt-8 px-8 py-3.5 w-full bg-liceo-primary hover:bg-liceo-primary/90 dark:bg-liceo-gold dark:hover:bg-yellow-400 rounded-xl shadow-lg dark:shadow-[0_4px_20px_rgba(255,217,0,0.3)] flex items-center justify-center gap-2 transition-all font-bold text-sm text-white dark:text-[#0B1526] disabled:opacity-50 disabled:cursor-wait"
                            >
                                {loading ? t.add.importing : t.add.mapAndImportBtn}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
