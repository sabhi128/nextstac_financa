import { supabase } from '../lib/supabase';
import { chartOfAccounts } from '../data/chartOfAccounts';

export const financeService = {
    // Seed accounts if table is empty
    async seedAccounts() {
        try {
            const { count, error: countError } = await supabase
                .from('accounts')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            if (count === 0) {
                // Map chartOfAccounts to match DB schema (assuming snake_case columns if needed, but usually JS objects work if columns match)
                // We'll remove the hardcoded 'id' to let DB generate UUIDs/IDs, or keep it if DB accepts text IDs.
                // Safest is to remove 'id' and let DB handle it, unless we really want to enforce those string IDs.
                // Given it's a custom setup, let's try to insert without ID first.
                const accountsToInsert = chartOfAccounts.map(({ id, ...rest }) => ({
                    ...rest,
                    // map camelCase to snake_case if necessary. Let's assume standard snake_case for DB columns.
                    normal_balance: rest.normalBalance
                }));

                // Remove the original normalBalance key
                const cleanedAccounts = accountsToInsert.map(({ normalBalance, ...rest }) => rest);

                const { error: insertError } = await supabase
                    .from('accounts')
                    .insert(cleanedAccounts);

                if (insertError) throw insertError;
                console.log('Accounts seeded successfully');
            }
        } catch (error) {
            console.error('Error seeding accounts:', error);
            throw error;
        }
    },

    // Fetch all accounts
    async fetchAccounts() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('name');

        if (error) throw error;

        // Map back to camelCase for frontend consistency if needed, 
        // or we can just update frontend to use snake_case. 
        // Let's map to keep frontend changes minimal where possible, but updating frontend is cleaner long term.
        // The requirement says "Refactor App.jsx... to join data...".
        // Let's return raw data and update frontend to handle it.
        return data;
    },

    // Add a transaction
    async addTransaction(transaction) {
        // transaction object expected: { date, description, amount, debit_account_id, credit_account_id }
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message || 'Failed to post transaction');
        }
        return data[0];
    },

    // Fetch transactions with account details
    async fetchTransactions() {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        debit_account:accounts!debit_account_id(id, name, type),
        credit_account:accounts!credit_account_id(id, name, type)
      `)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
