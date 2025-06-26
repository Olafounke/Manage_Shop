import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private tokenKey = 'token';
  private isValidToken = signal<boolean>(false);

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    const [payloadB64] = token.split('.');
    try {
      return JSON.parse(atob(payloadB64));
    } catch {
      return null;
    }
  }

  getIsValidToken(): boolean {
    return this.isValidToken();
  }

  setIsValidToken(isValid: boolean): void {
    this.isValidToken.set(isValid);
  }

  async verifyToken(): Promise<{ isValidToken: boolean; tokenData: any }> {
    const tokenData = this.decodeToken();
    if (!tokenData || !this.isTokenExpirationValid(tokenData)) {
      this.setIsValidToken(false);
      return { isValidToken: false, tokenData: null };
    }

    const dataWithoutPoW = `${tokenData.userId}|${tokenData.role}|${tokenData.deviceFingerprint}|${tokenData.issuedAt}|${tokenData.expiresIn}|`;
    const proofOfWork = await this.sha256Hex(dataWithoutPoW + tokenData.nonce);
    const isValidToken =
      proofOfWork.startsWith('000') && proofOfWork === tokenData.proofOfWork;

    this.setIsValidToken(isValidToken);
    if (isValidToken) {
      return { isValidToken, tokenData };
    } else {
      return { isValidToken, tokenData: null };
    }
  }

  isTokenExpirationValid(tokenData: any): boolean {
    const currentTime = Date.now();
    return tokenData.expiresIn > currentTime;
  }

  private async sha256Hex(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const PoWBuffer = await crypto.subtle.digest('SHA-256', data);
    const PoWArray = Array.from(new Uint8Array(PoWBuffer));
    return PoWArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
