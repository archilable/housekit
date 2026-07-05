'use client'

import { useState } from 'react'
import DoctorTab from './DoctorTab'
import DoctorHistoryList from './DoctorHistoryList'

type DoctorHistory = {
  id: string
  houseId: string
  description: string | null
  imageBase64: string | null
  result: string
  resolved: boolean
  resolvedAt: Date | string | null
  createdAt: Date | string
}

export default function DoctorSection({ houseId, initialHistories }: { houseId: string; initialHistories: DoctorHistory[] }) {
  const [extra, setExtra] = useState<DoctorHistory[]>([])

  function handleDiagnosed(entry: DoctorHistory) {
    setExtra(prev => [entry, ...prev])
  }

  return (
    <>
      <DoctorTab houseId={houseId} onDiagnosed={handleDiagnosed} />
      <DoctorHistoryList histories={[...extra, ...initialHistories]} />
    </>
  )
}
