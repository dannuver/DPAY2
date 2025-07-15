
#![no_std]
use soroban_sdk::{contractimpl, Env};

pub struct OffRampContract;

#[contractimpl]
impl OffRampContract {
    pub fn hello(env: Env) {
        // Contrato mínimo funcional
    }
}


