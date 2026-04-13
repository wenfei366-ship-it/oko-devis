import ContractWorkspace from '@/app/components/contract/ContractWorkspace'

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ContractWorkspace contractId={id} readOnly={true} />
}
