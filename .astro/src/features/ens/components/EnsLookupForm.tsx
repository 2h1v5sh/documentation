import h from "preact"
import { EnsOptions } from "../data"
import { useState } from "preact/hooks"
import styles from "./EnsLookupForm.module.css"
import { mainnetProvider } from "~/config/web3Providers"

export const EnsLookupForm = () => {
  const [ensResult, setEnsResult] = useState<
    | {
        ensName: string
        address: string
        hash: string
      }
    | undefined
  >()
  const [isLoading, setIsLoading] = useState(false)
  async function getDropdownAddress(selectedEnsString: string) {
    if (selectedEnsString === "") {
      return
    }
    setIsLoading(true)

    try {
      const data = JSON.stringify({
        query: `{
            domains(where:{name:"${selectedEnsString}"}) {
              id
              name
            }
          }`,
      })

      const response = await fetch(
        "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
        {
          method: "post",
          body: data,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "User-Agent": "Node",
          },
        }
      )
      const json = await response.json()
      const hashName = json.data.domains[0]
        ? json.data.domains[0].id
        : "Not Found"

      const result = await mainnetProvider.resolveName(selectedEnsString)

      setEnsResult({
        ensName: selectedEnsString,
        address: result,
        hash: hashName,
      })
    } catch (e) {
      setEnsResult({
        ensName: selectedEnsString,
        address: "Not found",
        hash: "Not found",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form class={styles.form}>
        <label>Pair:</label>
        <select
          onChange={(e) => {
            getDropdownAddress(e.target.value)
          }}
        >
          <option value="">Choose Pair</option>
          {EnsOptions.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
        <label>ENS Name:</label>
        <input
          value={isLoading ? "Loading..." : ensResult ? ensResult.ensName : ""}
        />
        <label>Address:</label>
        <input
          value={isLoading ? "Loading..." : ensResult ? ensResult.address : ""}
        />
        <label>Hash ID:</label>
        <input
          value={isLoading ? "Loading..." : ensResult ? ensResult.hash : ""}
        />
      </form>
    </div>
  )
}