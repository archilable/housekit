'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        marginTop: 4,
        background: pending ? '#162040' : '#1d4ed8',
        color: pending ? '#60a5fa' : '#fff',
        border: 'none',
        borderRadius: 14,
        padding: '15px',
        fontSize: 18,
        fontWeight: 500,
        cursor: pending ? 'not-allowed' : 'pointer',
        width: '100%',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {pending && (
        <span style={{
          width: 16, height: 16, border: '2px solid #60a5fa44', borderTopColor: '#60a5fa',
          borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {pending ? (loadingLabel || '저장 중...') : label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
