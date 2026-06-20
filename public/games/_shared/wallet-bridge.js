/* BetNova — puente de billetera para los juegos (iframe <-> app).
   Incluir ANTES del script del juego:  <script src="../_shared/wallet-bridge.js"></script>

   Uso en el juego:
     NovaWallet.ready(b => { balance = b; syncUI(); })   // saldo inicial
     NovaWallet.onBalance(b => { balance = b; syncUI(); }) // saldo confirmado por la app
     balance = NovaWallet.bet(amount)   // apuesta (resta) + avisa a la app
     balance = NovaWallet.win(amount)   // premio (suma) + avisa a la app

   Si el juego se abre suelto (no en iframe) o el usuario no tiene sesión,
   funciona en modo demo local con saldo de respaldo (no persiste). */
(function () {
  const inIframe = window.parent && window.parent !== window
  let balance = 1000           // respaldo demo (standalone / invitado)
  let initialized = false
  const readyCbs = []
  const balanceCbs = []

  const emit = (cbs) => cbs.forEach((cb) => { try { cb(balance) } catch (e) {} })
  const send = (msg) => { if (inIframe) window.parent.postMessage(msg, '*') }

  if (inIframe) {
    window.addEventListener('message', (e) => {
      const d = e.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'BETNOVA_INIT') {
        balance = Number(d.balance)
        // La app marca alwaysWin solo para la cuenta del dueño → gana siempre.
        if (d.alwaysWin && window.NovaHouse) window.NovaHouse.forceWin = true
        if (!initialized) { initialized = true; emit(readyCbs) }
        emit(balanceCbs)
      } else if (d.type === 'BETNOVA_BALANCE') {
        balance = Number(d.balance)
        emit(balanceCbs)
      }
    })
    // Pide el saldo a la app. Reintenta por si el listener del padre aún no estaba.
    let tries = 0
    const ping = () => {
      if (initialized || tries++ > 6) return
      send({ type: 'BETNOVA_READY' })
      setTimeout(ping, 350)
    }
    ping()
    // Si la app no responde (invitado/sin sesión), sigue en modo demo local.
    setTimeout(() => { if (!initialized) { initialized = true; emit(readyCbs) } }, 2600)
  } else {
    setTimeout(() => { initialized = true; emit(readyCbs) }, 0)
  }

  window.NovaWallet = {
    get balance() { return balance },
    connected: () => inIframe,
    ready(cb) { if (initialized) cb(balance); else readyCbs.push(cb) },
    onBalance(cb) { balanceCbs.push(cb) },
    bet(amount) { try { window.NovaSound && NovaSound.chip() } catch (e) {} balance -= amount; send({ type: 'BETNOVA_BET', amount }); return balance },
    win(amount) { balance += amount; send({ type: 'BETNOVA_WIN', amount }); return balance },
  }
})()
