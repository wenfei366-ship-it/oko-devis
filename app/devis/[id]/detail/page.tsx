import DevisDetailClient from './DevisDetailClient'

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DevisDetailClient devisId={id} />
}
