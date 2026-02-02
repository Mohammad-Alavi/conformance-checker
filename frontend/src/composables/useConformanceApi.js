/**
 * Composable for interacting with the n8n Conformance API
 */
import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://n8n.mohammadalavi.com/webhook'

export function useConformanceApi() {
  const loading = ref(false)
  const error = ref(null)
  const result = ref(null)

  /**
   * Check conformance of content
   * @param {'objective' | 'goal'} type - The content type to check
   * @param {string} title - The title/content to check
   * @param {string} description - Optional description
   * @returns {Promise<Object>} The conformance result
   */
  async function checkConformance(type, title, description = '') {
    loading.value = true
    error.value = null
    result.value = null

    try {
      const endpoint = type === 'objective'
        ? `${API_BASE_URL}/frozen/conformance/objective`
        : `${API_BASE_URL}/frozen/conformance/goal`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-test-token-12345678901234567890123456789012',
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      result.value = data
      return data
    } catch (e) {
      error.value = e.message || 'An error occurred while checking conformance'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Check objective conformance
   */
  async function checkObjective(title, description = '') {
    return checkConformance('objective', title, description)
  }

  /**
   * Check goal conformance
   */
  async function checkGoal(title, description = '') {
    return checkConformance('goal', title, description)
  }

  /**
   * Reset the state
   */
  function reset() {
    loading.value = false
    error.value = null
    result.value = null
  }

  return {
    loading,
    error,
    result,
    checkConformance,
    checkObjective,
    checkGoal,
    reset,
  }
}
