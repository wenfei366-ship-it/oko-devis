export default async function ContractSendPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ContractSendClient contractId={id} />
}

import ContractSendClient from './ContractSendClient'
