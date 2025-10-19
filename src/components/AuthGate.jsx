import React, { useState } from 'react'
import useSessionStore from '../store/session.js'

export default function AuthGate() {
  const login = useSessionStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(username, password)
    if (!ok) {
      setError(true)
      setTimeout(() => setError(false), 800)
    }
  }

  return (
    <div className={`auth-gate ${error ? 'refuse' : ''}`}>
      <div className={`panel ${error ? 'shake' : ''}`}>
        <h1>編集モード</h1>
        <p>ログインIDとパスワードを入力してください</p>
        <form onSubmit={handleSubmit} className="form" autoComplete="off">
          <input
            type="text"
            placeholder="ログインID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={error ? 'input-error' : ''}
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error ? 'input-error' : ''}
            autoComplete="off"
            inputMode="numeric"
          />
          <button type="submit">ログイン</button>
        </form>
      </div>
    </div>
  )
}