import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ParentBillboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: posts } = await supabase
        .from('billboard_posts')
        .select('*')
        .eq('category', 'publico')
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-3xl font-black text-liceo-primary dark:text-liceo-gold uppercase tracking-tight">
                Cartelera M13
            </h1>

            <div className="grid gap-6">
                {posts && posts.length > 0 ? posts.map((post: any) => (
                    <div key={post.id} className="bg-white dark:bg-[#111f38] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-liceo-gold/10 text-liceo-gold text-[10px] font-black rounded-full uppercase">OFICIAL</span>
                            <span className="text-xs text-gray-400 font-bold">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h2 className="text-xl font-bold mb-3 dark:text-white">{post.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
                        <p className="text-gray-400 font-bold">No hay anuncios publicados para familias en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
