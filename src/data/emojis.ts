export type Emoji = {
  emoji: string
  name: string
  keywords: string[]
}

export type EmojiCategory = {
  id: string
  name: string
  emojis: Emoji[]
}

export const emojiCategories: EmojiCategory[] = [
  {
    id: 'suggested',
    name: 'Sugestões para Vendas',
    emojis: [
      {
        emoji: '🔥',
        name: 'Fogo',
        keywords: ['fire', 'hot', 'quente', 'oferta', 'promoção'],
      },
      {
        emoji: '📱',
        name: 'Celular',
        keywords: ['phone', 'mobile', 'celular', 'smartphone'],
      },
      {
        emoji: '💸',
        name: 'Dinheiro voando',
        keywords: ['money', 'cash', 'dinheiro', 'desconto'],
      },
      {
        emoji: '💳',
        name: 'Cartão de Crédito',
        keywords: ['credit', 'card', 'cartão', 'pagamento'],
      },
      {
        emoji: '📦',
        name: 'Pacote',
        keywords: ['package', 'box', 'pacote', 'entrega'],
      },
      {
        emoji: '🚚',
        name: 'Caminhão',
        keywords: ['truck', 'delivery', 'caminhão', 'entrega'],
      },
      {
        emoji: '✅',
        name: 'Check',
        keywords: ['check', 'done', 'feito', 'aprovado', 'disponível'],
      },
      {
        emoji: '⚠️',
        name: 'Aviso',
        keywords: ['warning', 'alert', 'atenção', 'aviso'],
      },
      { emoji: '🆕', name: 'Novo', keywords: ['new', 'novo', 'lançamento'] },
      {
        emoji: '⚡',
        name: 'Raio',
        keywords: ['zap', 'flash', 'rápido', 'oferta relâmpago'],
      },
      {
        emoji: '💎',
        name: 'Diamante',
        keywords: ['gem', 'diamond', 'jóia', 'premium', 'luxo'],
      },
      {
        emoji: '🛡️',
        name: 'Escudo',
        keywords: ['shield', 'protect', 'segurança', 'garantia'],
      },
      {
        emoji: '💰',
        name: 'Saco de Dinheiro',
        keywords: ['money', 'bag', 'saco', 'dinheiro'],
      },
      {
        emoji: '🏷️',
        name: 'Etiqueta',
        keywords: ['tag', 'label', 'preço', 'oferta'],
      },
      {
        emoji: '📢',
        name: 'Megafone',
        keywords: ['loudspeaker', 'anúncio', 'promoção'],
      },
      {
        emoji: '📍',
        name: 'Pin',
        keywords: ['pin', 'location', 'localização'],
      },
      {
        emoji: '📆',
        name: 'Calendário',
        keywords: ['calendar', 'date', 'data', 'agendamento'],
      },
      {
        emoji: '🚀',
        name: 'Foguete',
        keywords: ['rocket', 'foguete', 'rápido', 'lançamento'],
      },
      { emoji: '⌚', name: 'Relógio', keywords: ['watch', 'relógio', 'tempo'] },
      {
        emoji: '🎧',
        name: 'Fones',
        keywords: ['headphones', 'fones', 'áudio'],
      },
      {
        emoji: '🔋',
        name: 'Bateria',
        keywords: ['battery', 'bateria', 'energia'],
      },
      {
        emoji: '🔌',
        name: 'Tomada',
        keywords: ['plug', 'tomada', 'carregador'],
      },
    ],
  },
  {
    id: 'smileys',
    name: 'Carinhas e Emoções',
    emojis: [
      { emoji: '😀', name: 'Sorrindo', keywords: ['smile', 'happy', 'feliz'] },
      {
        emoji: '😃',
        name: 'Sorrindo muito',
        keywords: ['smile', 'happy', 'feliz'],
      },
      {
        emoji: '😄',
        name: 'Sorrindo com olhos fechados',
        keywords: ['smile', 'happy', 'feliz'],
      },
      {
        emoji: '😁',
        name: 'Sorrindo mostrando dentes',
        keywords: ['smile', 'happy', 'feliz'],
      },
      {
        emoji: '😆',
        name: 'Sorrindo muito com olhos fechados',
        keywords: ['smile', 'happy', 'laugh', 'risada'],
      },
      {
        emoji: '😅',
        name: 'Suor frio',
        keywords: ['sweat', 'smile', 'alívio'],
      },
      {
        emoji: '🤣',
        name: 'Rindo muito',
        keywords: ['laugh', 'rolling', 'risada'],
      },
      {
        emoji: '😂',
        name: 'Chorando de rir',
        keywords: ['joy', 'laugh', 'risada'],
      },
      { emoji: '🙂', name: 'Sorriso leve', keywords: ['smile', 'leve'] },
      {
        emoji: '🙃',
        name: 'De cabeça para baixo',
        keywords: ['upside', 'down'],
      },
      { emoji: '😉', name: 'Piscando', keywords: ['wink', 'piscar'] },
      {
        emoji: '😊',
        name: 'Sorriso tímido',
        keywords: ['blush', 'smile', 'tímido'],
      },
      { emoji: '😇', name: 'Anjo', keywords: ['angel', 'anjo', 'inocente'] },
      {
        emoji: '🥰',
        name: 'Apaixonado',
        keywords: ['love', 'amor', 'coração'],
      },
      {
        emoji: '😍',
        name: 'Olhos de coração',
        keywords: ['love', 'amor', 'coração'],
      },
      {
        emoji: '🤩',
        name: 'Estrelas nos olhos',
        keywords: ['star', 'eyes', 'fã'],
      },
      { emoji: '😘', name: 'Beijo', keywords: ['kiss', 'beijo'] },
      { emoji: '😗', name: 'Beijo simples', keywords: ['kiss', 'beijo'] },
      { emoji: '🤑', name: 'Dinheiro', keywords: ['money', 'rich', 'rico'] },
      { emoji: '🤗', name: 'Abraço', keywords: ['hug', 'abraço'] },
      { emoji: '🤔', name: 'Pensando', keywords: ['think', 'pensando'] },
      {
        emoji: '🤐',
        name: 'Boca fechada',
        keywords: ['zipper', 'mouth', 'segredo'],
      },
      {
        emoji: '😎',
        name: 'Óculos escuros',
        keywords: ['cool', 'sunglasses', 'legal'],
      },
      {
        emoji: '🤯',
        name: 'Cabeça explodindo',
        keywords: ['mind', 'blown', 'explodindo'],
      },
      { emoji: '😱', name: 'Grito', keywords: ['scream', 'medo', 'susto'] },
      {
        emoji: '👍',
        name: 'Jóia',
        keywords: ['thumbs', 'up', 'like', 'curtir'],
      },
      {
        emoji: '👎',
        name: 'Descurtir',
        keywords: ['thumbs', 'down', 'dislike'],
      },
      { emoji: '👏', name: 'Palmas', keywords: ['clap', 'applause', 'palmas'] },
      {
        emoji: '🙌',
        name: 'Mãos levantadas',
        keywords: ['hands', 'up', 'comemorar'],
      },
      {
        emoji: '🤝',
        name: 'Aperto de mão',
        keywords: ['handshake', 'deal', 'acordo'],
      },
      {
        emoji: '🙏',
        name: 'Rezar',
        keywords: ['pray', 'please', 'por favor', 'obrigado'],
      },
    ],
  },
  {
    id: 'objects',
    name: 'Objetos e Tecnologia',
    emojis: [
      {
        emoji: '💻',
        name: 'Laptop',
        keywords: ['laptop', 'computer', 'computador'],
      },
      {
        emoji: '🖥️',
        name: 'Desktop',
        keywords: ['desktop', 'computer', 'computador'],
      },
      { emoji: '🖨️', name: 'Impressora', keywords: ['printer', 'impressora'] },
      { emoji: '🖱️', name: 'Mouse', keywords: ['mouse'] },
      { emoji: '📷', name: 'Câmera', keywords: ['camera', 'foto'] },
      {
        emoji: '📸',
        name: 'Câmera com flash',
        keywords: ['camera', 'flash', 'foto'],
      },
      {
        emoji: '📹',
        name: 'Filmadora',
        keywords: ['video', 'camera', 'vídeo'],
      },
      { emoji: '📺', name: 'TV', keywords: ['tv', 'television', 'televisão'] },
      { emoji: '🔊', name: 'Som alto', keywords: ['speaker', 'loud', 'som'] },
      {
        emoji: '🔔',
        name: 'Sino',
        keywords: ['bell', 'notification', 'notificação'],
      },
      { emoji: '🔍', name: 'Lupa', keywords: ['search', 'busca'] },
      { emoji: '🔑', name: 'Chave', keywords: ['key', 'chave'] },
      {
        emoji: '🛒',
        name: 'Carrinho',
        keywords: ['cart', 'shopping', 'compras'],
      },
      {
        emoji: '🎁',
        name: 'Presente',
        keywords: ['gift', 'present', 'presente'],
      },
    ],
  },
  {
    id: 'symbols',
    name: 'Símbolos',
    emojis: [
      {
        emoji: '❤️',
        name: 'Coração Vermelho',
        keywords: ['heart', 'red', 'amor'],
      },
      { emoji: '🧡', name: 'Coração Laranja', keywords: ['heart', 'orange'] },
      { emoji: '💛', name: 'Coração Amarelo', keywords: ['heart', 'yellow'] },
      { emoji: '💚', name: 'Coração Verde', keywords: ['heart', 'green'] },
      { emoji: '💙', name: 'Coração Azul', keywords: ['heart', 'blue'] },
      { emoji: '💜', name: 'Coração Roxo', keywords: ['heart', 'purple'] },
      { emoji: '🖤', name: 'Coração Preto', keywords: ['heart', 'black'] },
      { emoji: '🤍', name: 'Coração Branco', keywords: ['heart', 'white'] },
      { emoji: '💯', name: '100', keywords: ['100', 'score', 'cem'] },
      { emoji: '💢', name: 'Raiva', keywords: ['anger', 'raiva'] },
      {
        emoji: '💥',
        name: 'Colisão',
        keywords: ['collision', 'boom', 'explosão'],
      },
      { emoji: '💦', name: 'Suor', keywords: ['sweat', 'suor'] },
      { emoji: '💨', name: 'Vento', keywords: ['dash', 'run', 'correr'] },
      { emoji: '💫', name: 'Tontura', keywords: ['dizzy', 'star', 'estrela'] },
      {
        emoji: '💬',
        name: 'Balão de fala',
        keywords: ['speech', 'bubble', 'fala'],
      },
      { emoji: '❌', name: 'X', keywords: ['x', 'cross', 'erro'] },
      { emoji: '⭕', name: 'Círculo', keywords: ['circle', 'círculo'] },
      { emoji: '❗', name: 'Exclamação', keywords: ['exclamation', 'atenção'] },
      { emoji: '❓', name: 'Interrogação', keywords: ['question', 'dúvida'] },
      {
        emoji: '➡️',
        name: 'Seta Direita',
        keywords: ['arrow', 'right', 'direita'],
      },
      {
        emoji: '⬅️',
        name: 'Seta Esquerda',
        keywords: ['arrow', 'left', 'esquerda'],
      },
      { emoji: '⬆️', name: 'Seta Cima', keywords: ['arrow', 'up', 'cima'] },
      { emoji: '⬇️', name: 'Seta Baixo', keywords: ['arrow', 'down', 'baixo'] },
    ],
  },
]

// Flattened list for search
export const allEmojis = emojiCategories.flatMap((cat) => cat.emojis)
