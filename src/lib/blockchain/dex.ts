import { ethers, Contract, Wallet } from "ethers";
import { getProvider } from "./provider";
import { approveToken, getTokenAllowance } from "./tokens";

// PancakeSwap V2 Router Address (BSC Testnet)
// Source: https://pancakeswap.finance/
export const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

// WBNB Address on BSC Testnet
export const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"; 

/**
 * Get Router Contract
 */
// ...
export function getRouterContract(signerOrProvider?: ethers.Signer | ethers.Provider): Contract {
  const provider = signerOrProvider || getProvider(97);
  return new Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
}

/**
 * Get Swap Quote (Amount Out)
 */
export async function getSwapQuote(
  amountIn: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  decimalsIn: number,
  decimalsOut: number
): Promise<string> {
  try {
    const router = getRouterContract();
    
    // Handle Native BNB (use WBNB for path)
    const pathIn = tokenInAddress === "BNB" ? WBNB_ADDRESS : tokenInAddress;
    const pathOut = tokenOutAddress === "BNB" ? WBNB_ADDRESS : tokenOutAddress;

    if (pathIn.toLowerCase() === pathOut.toLowerCase()) return amountIn;

    const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
    
    const amounts = await router.getAmountsOut(amountInWei, [pathIn, pathOut]);
    const amountOutWei = amounts[1];
    
    return ethers.formatUnits(amountOutWei, decimalsOut);
  } catch (error) {
    console.error("Failed to get quote:", error);
    return "0";
  }
}

// ...

export async function executeSwap(
  signer: ethers.Signer,
  amountIn: string,
  tokenInAddress: string,
  tokenOutAddress: string,
  decimalsIn: number,
  slippagePercent: number = 0.5
): Promise<ethers.TransactionResponse> {
  const router = getRouterContract(signer);
// ...
  const address = await signer.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

  // Handle Native BNB
  const isNativeIn = tokenInAddress === "BNB";
  const isNativeOut = tokenOutAddress === "BNB";
  
  const pathIn = isNativeIn ? WBNB_ADDRESS : tokenInAddress;
  const pathOut = isNativeOut ? WBNB_ADDRESS : tokenOutAddress;
  const path = [pathIn, pathOut];

  const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
  
  // Calculate Min Amount Out (Slippage)
  // fetch quote again to be safe/fresh
  const amounts = await router.getAmountsOut(amountInWei, path);
  const expectedOut = amounts[1];
  const minAmountOut = expectedOut - (expectedOut * BigInt(slippagePercent * 100)) / BigInt(10000); 

  if (isNativeIn) {
    // BNB -> Token
    return router.swapExactETHForTokens(
      minAmountOut,
      path,
      address,
      deadline,
      { value: amountInWei }
    );
  } else if (isNativeOut) {
    // Token -> BNB
    // Check Allowance first! (Caller should ideally check/approve before calling this, but we can double check)
    // Assuming caller handled approval.
    
    return router.swapExactTokensForETH(
      amountInWei,
      minAmountOut,
      path,
      address,
      deadline
    );
  } else {
    // Token -> Token
    return router.swapExactTokensForTokens(
      amountInWei,
      minAmountOut,
      path,
      address,
      deadline
    );
  }
}
