#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Env, Map, String, Symbol, Vec,
};

#[derive(Clone)]
#[contracttype]
pub struct PaymentRecord {
    pub mpesa_receipt: String,
    pub amount_kes: i128,
    pub amount_usdc: i128,
    pub phone_number: String,
    pub timestamp: u64,
    pub checkout_request_id: String,
    pub status: Symbol,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    PaymentRecord(String), // Key: checkout_request_id
    PaymentCount,
    AdminKey,
}

const ADMIN: Symbol = symbol_short!("admin");
const ACTIVE: Symbol = symbol_short!("active");
const PENDING: Symbol = symbol_short!("pending");
const FAILED: Symbol = symbol_short!("failed");

#[contract]
pub struct PaymentContract;

#[contractimpl]
impl PaymentContract {
    /// Initialize the contract with admin address
    pub fn initialize(env: Env, admin: String) {
        let admin_key = DataKey::AdminKey;
        env.storage().instance().set(&admin_key, &admin);

        // Initialize payment count
        let count_key = DataKey::PaymentCount;
        env.storage().instance().set(&count_key, &0i128);
    }

    /// Record a new payment from M-Pesa
    pub fn record_payment(
        env: Env,
        mpesa_receipt: String,
        amount_kes: i128,
        amount_usdc: i128,
        phone_number: String,
        timestamp: u64,
        checkout_request_id: String,
    ) -> PaymentRecord {
        // Validate inputs
        if mpesa_receipt.len() == 0 {
            panic!("M-Pesa receipt cannot be empty");
        }
        if amount_kes <= 0 {
            panic!("KES amount must be positive");
        }
        if amount_usdc <= 0 {
            panic!("USDC amount must be positive");
        }
        if phone_number.len() == 0 {
            panic!("Phone number cannot be empty");
        }
        if checkout_request_id.len() == 0 {
            panic!("Checkout request ID cannot be empty");
        }

        // Check if payment already exists
        let payment_key = DataKey::PaymentRecord(checkout_request_id.clone());
        if env.storage().persistent().has(&payment_key) {
            panic!("Payment record already exists");
        }

        // Create payment record
        let payment_record = PaymentRecord {
            mpesa_receipt: mpesa_receipt.clone(),
            amount_kes,
            amount_usdc,
            phone_number: phone_number.clone(),
            timestamp,
            checkout_request_id: checkout_request_id.clone(),
            status: ACTIVE,
        };

        // Store payment record
        env.storage()
            .persistent()
            .set(&payment_key, &payment_record);

        // Increment payment count
        let count_key = DataKey::PaymentCount;
        let current_count: i128 = env.storage().instance().get(&count_key).unwrap_or(0);
        env.storage()
            .instance()
            .set(&count_key, &(current_count + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("payment"), symbol_short!("recorded")),
            (
                checkout_request_id.clone(),
                mpesa_receipt,
                amount_kes,
                amount_usdc,
            ),
        );

        payment_record
    }

    /// Get payment record by checkout request ID
    pub fn get_payment(env: Env, checkout_request_id: String) -> Option<PaymentRecord> {
        let payment_key = DataKey::PaymentRecord(checkout_request_id);
        env.storage().persistent().get(&payment_key)
    }

    /// Update payment status
    pub fn update_payment_status(
        env: Env,
        checkout_request_id: String,
        new_status: Symbol,
    ) -> PaymentRecord {
        let payment_key = DataKey::PaymentRecord(checkout_request_id.clone());

        let mut payment_record: PaymentRecord = env
            .storage()
            .persistent()
            .get(&payment_key)
            .expect("Payment record not found");

        // Validate status
        if new_status != ACTIVE && new_status != PENDING && new_status != FAILED {
            panic!("Invalid status");
        }

        payment_record.status = new_status.clone();
        env.storage()
            .persistent()
            .set(&payment_key, &payment_record);

        // Emit event
        env.events().publish(
            (symbol_short!("payment"), symbol_short!("updated")),
            (checkout_request_id, new_status),
        );

        payment_record
    }

    /// Get total number of payments recorded
    pub fn get_payment_count(env: Env) -> i128 {
        let count_key = DataKey::PaymentCount;
        env.storage().instance().get(&count_key).unwrap_or(0)
    }

    /// Get payments by status (limited to last 100)
    pub fn get_payments_by_status(env: Env, status: Symbol) -> Vec<PaymentRecord> {
        let mut payments = Vec::new(&env);
        let count = Self::get_payment_count(env.clone());
        let max_check = if count > 100 { count - 100 } else { 0 };

        // This is a simplified implementation - in production, you'd want
        // a more efficient indexing system
        for i in max_check..count {
            // Note: This is a placeholder - you'd need to implement proper
            // payment retrieval logic based on your indexing strategy
        }

        payments
    }

    /// Verify payment exists and return basic info
    pub fn verify_payment_exists(env: Env, checkout_request_id: String) -> bool {
        let payment_key = DataKey::PaymentRecord(checkout_request_id);
        env.storage().persistent().has(&payment_key)
    }

    /// Get payment summary for dashboard
    pub fn get_payment_summary(env: Env, checkout_request_id: String) -> Map<Symbol, String> {
        let mut summary = Map::new(&env);
        let payment_key = DataKey::PaymentRecord(checkout_request_id.clone());

        if let Some(payment) = env
            .storage()
            .persistent()
            .get::<DataKey, PaymentRecord>(&payment_key)
        {
            summary.set(symbol_short!("receipt"), payment.mpesa_receipt);
            summary.set(symbol_short!("kes"), payment.amount_kes.to_string());
            summary.set(symbol_short!("usdc"), payment.amount_usdc.to_string());
            summary.set(symbol_short!("phone"), payment.phone_number);
            summary.set(symbol_short!("status"), payment.status.to_string());
            summary.set(symbol_short!("timestamp"), payment.timestamp.to_string());
        }

        summary
    }

    /// Admin function to get contract info
    pub fn get_contract_info(env: Env) -> Map<Symbol, String> {
        let mut info = Map::new(&env);
        let admin_key = DataKey::AdminKey;

        if let Some(admin) = env.storage().instance().get::<DataKey, String>(&admin_key) {
            info.set(symbol_short!("admin"), admin);
        }

        let count = Self::get_payment_count(env);
        info.set(symbol_short!("count"), count.to_string());

        info
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Events, Env};

    #[test]
    fn test_initialize_contract() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentContract);
        let client = PaymentContractClient::new(&env, &contract_id);

        let admin = String::from_str(
            &env,
            "GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS",
        );
        client.initialize(&admin);

        let count = client.get_payment_count();
        assert_eq!(count, 0);
    }

    #[test]
    fn test_record_payment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentContract);
        let client = PaymentContractClient::new(&env, &contract_id);

        let admin = String::from_str(
            &env,
            "GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS",
        );
        client.initialize(&admin);

        let mpesa_receipt = String::from_str(&env, "RKG2H4I9J0");
        let amount_kes = 1000_0000000i128; // 1000 KES with 7 decimal places
        let amount_usdc = 7_700000i128; // ~7.7 USDC with 6 decimal places
        let phone_number = String::from_str(&env, "254712345678");
        let timestamp = 1704067200u64; // Unix timestamp
        let checkout_request_id = String::from_str(&env, "ws_CO_123456789");

        let payment = client.record_payment(
            &mpesa_receipt,
            &amount_kes,
            &amount_usdc,
            &phone_number,
            &timestamp,
            &checkout_request_id,
        );

        assert_eq!(payment.mpesa_receipt, mpesa_receipt);
        assert_eq!(payment.amount_kes, amount_kes);
        assert_eq!(payment.amount_usdc, amount_usdc);
        assert_eq!(payment.status, ACTIVE);

        let count = client.get_payment_count();
        assert_eq!(count, 1);

        // Verify payment exists
        let exists = client.verify_payment_exists(&checkout_request_id);
        assert!(exists);

        // Get payment
        let retrieved_payment = client.get_payment(&checkout_request_id).unwrap();
        assert_eq!(retrieved_payment.mpesa_receipt, mpesa_receipt);
    }

    #[test]
    fn test_update_payment_status() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentContract);
        let client = PaymentContractClient::new(&env, &contract_id);

        let admin = String::from_str(
            &env,
            "GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS",
        );
        client.initialize(&admin);

        let mpesa_receipt = String::from_str(&env, "RKG2H4I9J0");
        let amount_kes = 1000_0000000i128;
        let amount_usdc = 7_700000i128;
        let phone_number = String::from_str(&env, "254712345678");
        let timestamp = 1704067200u64;
        let checkout_request_id = String::from_str(&env, "ws_CO_123456789");

        // Record payment
        client.record_payment(
            &mpesa_receipt,
            &amount_kes,
            &amount_usdc,
            &phone_number,
            &timestamp,
            &checkout_request_id,
        );

        // Update status to failed
        let updated_payment = client.update_payment_status(&checkout_request_id, &FAILED);
        assert_eq!(updated_payment.status, FAILED);

        // Verify the status was updated
        let retrieved_payment = client.get_payment(&checkout_request_id).unwrap();
        assert_eq!(retrieved_payment.status, FAILED);
    }

    #[test]
    #[should_panic(expected = "Payment record already exists")]
    fn test_duplicate_payment_fails() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentContract);
        let client = PaymentContractClient::new(&env, &contract_id);

        let admin = String::from_str(
            &env,
            "GBYQZJFO6ECYUDG4UX2FWSZ47UGDCYZ3INDXLX4GQXHJ3A6WKSPT7CYS",
        );
        client.initialize(&admin);

        let mpesa_receipt = String::from_str(&env, "RKG2H4I9J0");
        let amount_kes = 1000_0000000i128;
        let amount_usdc = 7_700000i128;
        let phone_number = String::from_str(&env, "254712345678");
        let timestamp = 1704067200u64;
        let checkout_request_id = String::from_str(&env, "ws_CO_123456789");

        // Record payment first time
        client.record_payment(
            &mpesa_receipt,
            &amount_kes,
            &amount_usdc,
            &phone_number,
            &timestamp,
            &checkout_request_id,
        );

        // Try to record same payment again - should panic
        client.record_payment(
            &mpesa_receipt,
            &amount_kes,
            &amount_usdc,
            &phone_number,
            &timestamp,
            &checkout_request_id,
        );
    }
}
