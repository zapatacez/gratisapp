//create minimal api endpoint for testing
export async function GET({params,request }) {
  return new Response(
    JSON.stringify({
        message: "Hello from API!" })
  )
}