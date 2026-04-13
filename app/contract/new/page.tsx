import ContractWorkspace from '@/app/components/contract/ContractWorkspace'

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ fromDevis?: string }>
}) {
  const params = await searchParams
  return <ContractWorkspace fromDevisId={params.fromDevis} />
}
