
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
    const email = 'gonzalezme@gmail.com';
    const newPassword = 'Chapa#2001';

    console.log(`Resetting password for: ${email}...`);

    // Find user ID
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error listing users:', authError);
        return;
    }

    const user = authData.users.find(u => u.email === email);
    if (!user) {
        console.log('User not found.');
        return;
    }

    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (error) {
        console.error('Error updating password:', error.message);
    } else {
        console.log('Password updated successfully for', email);

        // Also ensure force_password_change is false if it was true
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ force_password_change: false })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error updating profile:', profileError.message);
        } else {
            console.log('Profile updated: force_password_change = false');
        }
    }
}

resetPassword();
