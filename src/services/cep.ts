interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export const fetchAddressByCEP = async (
  cep: string,
): Promise<ViaCepResponse | null> => {
  // Remove non-digits
  const cleanCep = cep.replace(/\D/g, '')

  // Validate length
  if (cleanCep.length !== 8) {
    return null
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

    if (!response.ok) {
      throw new Error('Erro ao consultar CEP')
    }

    const data = await response.json()

    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}
