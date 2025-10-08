import { useState, useEffect } from 'react'

// Hook customizado para localStorage que funciona de forma confiável
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error)
      return defaultValue
    }
  })

  const setStoredValue = (newValue) => {
    try {
      // Permitir que newValue seja uma função (como setState)
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error)
    }
  }

  return [value, setStoredValue]
}

export default useLocalStorage