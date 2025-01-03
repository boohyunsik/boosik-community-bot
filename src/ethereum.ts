export function isValidEthereumAddress(address: string): boolean {
    const trimmed = address.trim();
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(trimmed);
}