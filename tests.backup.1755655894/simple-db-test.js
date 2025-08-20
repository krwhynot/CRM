// Simple database connectivity test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixitjldcdvbazvjsnkao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXRqbGRjZHZiYXp2anNua2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg0MjEsImV4cCI6MjA3MDUwNDQyMX0.8h5jXRcT96R34m0MU7PVbgzJPpGvf5azgQd2wo5AB2Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
        // Test basic connection with a simple query
        const { data, error } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ Database query error:', error.message);
        } else {
            console.log('✅ Database connection successful');
            console.log('📊 Query result:', data ? data.length + ' rows' : 'No data');
        }
    } catch (err) {
        console.log('❌ Connection error:', err.message);
    }
    
    // Test table existence
    try {
        const { data: tables, error } = await supabase.rpc('get_table_names');
        
        if (error) {
            console.log('⚠️  Cannot list tables (expected with RLS)');
        } else {
            console.log('📋 Tables found:', tables?.length || 0);
        }
    } catch (err) {
        console.log('⚠️  Table listing not available');
    }
    
    console.log('✅ Basic database connectivity test completed');
}

testDatabaseConnection();