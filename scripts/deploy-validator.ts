
import { createPublicClient, createWalletClient, http, defineChain, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { config } from 'dotenv';
import path from 'path';

// Load backend env to get private key
config({ path: path.resolve(__dirname, '../../vessel-be/backend/.env') });
config({ path: path.resolve(__dirname, '../.env.local') });


async function main() {
    console.log('Starting deployment...');

    // 1. Get Code from Base Mainnet
    const mainnetClient = createPublicClient({
        chain: base,
        transport: http('https://mainnet.base.org'),
    });

    const validatorAddress = '0x7dd271fa79df3a5feb99f73bebfa4395b2e4f4be';
    console.log(`Fetching code for ${validatorAddress} from Base Mainnet...`);

    const code = await mainnetClient.getBytecode({
        address: validatorAddress,
    });

    if (!code || code === '0x') {
        console.error('Failed to fetch bytecode from Mainnet. Is the address correct?');
        process.exit(1);
    }

    console.log(`Got bytecode! Length: ${code.length}`);
    console.log('BYTECODE_START');
    console.log(code);
    console.log('BYTECODE_END');
    process.exit(0);
}

main().catch(console.error);
