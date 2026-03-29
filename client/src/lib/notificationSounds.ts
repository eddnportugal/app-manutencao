/**
 * Sistema de Sons para Notificações de Sincronização
 * Usa Web Audio API para gerar sons sem necessidade de arquivos externos
 */

// Contexto de áudio global
let audioContext: AudioContext | null = null;

// Inicializa o contexto de áudio (deve ser chamado após interação do usuário)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Gera um tom simples
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Não foi possível reproduzir som:', error);
  }
}

// Som de sucesso - dois tons ascendentes
export function playSyncSuccessSound() {
  playTone(523.25, 0.15, 'sine', 0.2); // C5
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.2), 150); // E5
}

// Som de erro - tom descendente
export function playSyncErrorSound() {
  playTone(392, 0.3, 'square', 0.15); // G4
  setTimeout(() => playTone(261.63, 0.4, 'square', 0.15), 200); // C4
}

// Som de nova operação pendente - bip curto
export function playPendingOperationSound() {
  playTone(880, 0.1, 'sine', 0.15); // A5
}

// Som de conexão restaurada - acorde alegre
export function playOnlineSound() {
  playTone(523.25, 0.15, 'sine', 0.2); // C5
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
  setTimeout(() => playTone(783.99, 0.25, 'sine', 0.2), 200); // G5
}

// Som de conexão perdida - tom grave
export function playOfflineSound() {
  playTone(196, 0.4, 'triangle', 0.2); // G3
}

// Som de notificação genérica
export function playNotificationSound() {
  playTone(698.46, 0.1, 'sine', 0.2); // F5
  setTimeout(() => playTone(880, 0.15, 'sine', 0.2), 100); // A5
}

// Verificar se sons estão habilitados (localStorage)
export function areSoundsEnabled(): boolean {
  return localStorage.getItem('sync-sounds-enabled') !== 'false';
}

// Habilitar/desabilitar sons
export function setSoundsEnabled(enabled: boolean) {
  localStorage.setItem('sync-sounds-enabled', enabled ? 'true' : 'false');
}

// Wrapper que verifica se sons estão habilitados antes de tocar
export const SyncSounds = {
  success: () => areSoundsEnabled() && playSyncSuccessSound(),
  error: () => areSoundsEnabled() && playSyncErrorSound(),
  pending: () => areSoundsEnabled() && playPendingOperationSound(),
  online: () => areSoundsEnabled() && playOnlineSound(),
  offline: () => areSoundsEnabled() && playOfflineSound(),
  notification: () => areSoundsEnabled() && playNotificationSound(),
  isEnabled: areSoundsEnabled,
  setEnabled: setSoundsEnabled,
};

export default SyncSounds;
