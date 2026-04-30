type AuthCallback = () => void

class AuthEventEmitter {
  private listeners: AuthCallback[] = []

  onUnauthorized(callback: AuthCallback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  emitUnauthorized() {
    this.listeners.forEach((callback) => callback())
  }
}

export const authEvents = new AuthEventEmitter()
