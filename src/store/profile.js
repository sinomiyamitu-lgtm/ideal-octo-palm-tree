import { create } from 'zustand'

const STORAGE_KEY = 'portfolio_profile'

const sample = {
  displayName: 'あなたの名前',
  bio: '短い紹介文。肩書きや得意分野など。',
  avatarUrl: '',
  socials: [
    { type: 'x', label: 'X', url: 'https://x.com/your_id' },
    { type: 'roblox', label: 'Roblox', url: 'https://www.roblox.com/users/your_id/profile' }
  ],
  skills: [
    // { name: 'UI Design', category: 'design', level: 3 },
    // { name: 'JavaScript', category: 'programming', level: 3 },
  ],
  updatedAt: new Date().toISOString(),
}

const safeLoad = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sample
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') return { ...sample, ...data }
    return sample
  } catch (_) {
    return sample
  }
}

const useProfileStore = create((set, get) => ({
  profile: safeLoad(),

  setProfile: (patch) => set(({ profile }) => ({ profile: { ...profile, ...patch, updatedAt: new Date().toISOString() } })),
  setName: (displayName) => set(({ profile }) => ({ profile: { ...profile, displayName, updatedAt: new Date().toISOString() } })),
  setBio: (bio) => set(({ profile }) => ({ profile: { ...profile, bio, updatedAt: new Date().toISOString() } })),
  setAvatarUrl: (avatarUrl) => set(({ profile }) => ({ profile: { ...profile, avatarUrl, updatedAt: new Date().toISOString() } })),
  

  addSocial: () => set(({ profile }) => ({
    profile: {
      ...profile,
      socials: [...(profile.socials || []), { type: 'link', label: 'Link', url: '' }],
      updatedAt: new Date().toISOString(),
    }
  })),
  updateSocial: (index, patch) => set(({ profile }) => ({
    profile: {
      ...profile,
      socials: (profile.socials || []).map((s, i) => i === index ? { ...s, ...patch } : s),
      updatedAt: new Date().toISOString(),
    }
  })),
  removeSocial: (index) => set(({ profile }) => ({
    profile: {
      ...profile,
      socials: (profile.socials || []).filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }
  })),

  addSkill: () => set(({ profile }) => ({
    profile: {
      ...profile,
      skills: [...(profile.skills || []), { name: '', category: 'design', level: 3 }],
      updatedAt: new Date().toISOString(),
    }
  })),
  updateSkill: (index, patch) => set(({ profile }) => ({
    profile: {
      ...profile,
      skills: (profile.skills || []).map((s, i) => i === index ? { ...s, ...patch } : s),
      updatedAt: new Date().toISOString(),
    }
  })),
  removeSkill: (index) => set(({ profile }) => ({
    profile: {
      ...profile,
      skills: (profile.skills || []).filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }
  })),

  
}))

// 永続化: profileが変わるたび保存
let __syncLockProfile = false
useProfileStore.subscribe((state) => {
  if (__syncLockProfile) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile))
  } catch (_) {}
})

// 他タブからの変更を自動取り込み
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const data = JSON.parse(e.newValue || '{}')
        const merged = data && typeof data === 'object' ? { ...stateDefaults(), ...data } : stateDefaults()
        const current = useProfileStore.getState().profile
        if (JSON.stringify(current) === JSON.stringify(merged)) return
        __syncLockProfile = true
        useProfileStore.setState({ profile: merged })
      } catch (_) {
        // ignore
      } finally {
        __syncLockProfile = false
      }
    }
  })
}

// デフォルト値（safeLoadと同じ構造）
function stateDefaults() {
  return {
    displayName: 'あなたの名前',
    bio: '短い紹介文。肩書きや得意分野など。',
    avatarUrl: '',
    socials: [
      { type: 'x', label: 'X', url: 'https://x.com/your_id' },
      { type: 'roblox', label: 'Roblox', url: 'https://www.roblox.com/users/your_id/profile' }
    ],
    skills: [],
    updatedAt: new Date().toISOString(),
  }
}

export default useProfileStore