import axios from 'axios'

class KretaTokenManager {
  private static instance: KretaTokenManager
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  private constructor() {}

  static getInstance(): KretaTokenManager {
    if (!KretaTokenManager.instance) {
      KretaTokenManager.instance = new KretaTokenManager()
    }
    return KretaTokenManager.instance
  }

  async getValidToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    await this.refreshToken()
    return this.accessToken!
  }

  private async refreshToken(): Promise<void> {
    const username = process.env.KRETA_USERNAME
    const password = process.env.KRETA_PASSWORD

    if (!username || !password) {
      throw new Error('Kréta credentials not found in environment variables')
    }

    console.log('Attempting Kreta login for user:', username)

    try {
      const response = await axios.post('https://idp.e-kreta.hu/connect/token', 
        new URLSearchParams({
          client_id: '919e0c1c-76a2-4646-a2fb-7085bbbf3c56',
          grant_type: 'password',
          username: username,
          password: password
        }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Kreta.Ellenorzo/4.0.0'
        }
      })

      console.log('Kreta login response status:', response.status)
      console.log('Kreta login response data:', response.data)

      if (response.data?.access_token) {
        this.accessToken = response.data.access_token
        this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
        console.log('Kreta token obtained successfully')
      } else {
        throw new Error('No access token in response')
      }
    } catch (error: any) {
      console.error('Kreta token error:', error.response?.data || error.message)
      throw new Error('Failed to get Kreta token: ' + (error.response?.data?.error || error.message))
    }
  }
}

export default KretaTokenManager