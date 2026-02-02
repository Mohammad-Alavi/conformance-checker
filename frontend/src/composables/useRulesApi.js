/**
 * Composable for interacting with the n8n Rules Management API
 * CRUD operations for conformance rules (objectives and goals)
 */
import { ref, computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://n8n.mohammadalavi.com/webhook'
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'test-token-123'

export function useRulesApi() {
  const loading = ref(false)
  const error = ref(null)
  const rules = ref([])
  const currentRule = ref(null)

  // Computed properties
  const objectiveRules = computed(() =>
    rules.value.filter(r => r.content_type === 'objective')
  )

  const goalRules = computed(() =>
    rules.value.filter(r => r.content_type === 'goal')
  )

  const rulesByCategory = computed(() => {
    const grouped = {}
    rules.value.forEach(rule => {
      const category = rule.category || 'Uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(rule)
    })
    return grouped
  })

  /**
   * Common fetch wrapper with auth
   */
  async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`)
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return null
  }

  /**
   * List all rules by type
   * @param {'objective' | 'goal'} type - The rule type to fetch
   */
  async function listRules(type = 'objective') {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch(`/api/v1/rules?type=${type}`)

      // Merge with existing rules of different type
      const otherTypeRules = rules.value.filter(r => r.content_type !== type)
      const newRules = Array.isArray(data) ? data : (data.rules || data.data || [])
      rules.value = [...otherTypeRules, ...newRules]

      return newRules
    } catch (e) {
      error.value = e.message || 'Failed to fetch rules'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all rules (both types)
   */
  async function fetchAllRules() {
    loading.value = true
    error.value = null

    try {
      const [objectiveData, goalData] = await Promise.all([
        apiFetch('/api/v1/rules?type=objective'),
        apiFetch('/api/v1/rules?type=goal'),
      ])

      const objectiveRules = Array.isArray(objectiveData) ? objectiveData : (objectiveData.rules || objectiveData.data || [])
      const goalRules = Array.isArray(goalData) ? goalData : (goalData.rules || goalData.data || [])

      rules.value = [...objectiveRules, ...goalRules]
      return rules.value
    } catch (e) {
      error.value = e.message || 'Failed to fetch rules'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a single rule by ID
   * @param {string} ruleId - The rule ID
   */
  async function getRule(ruleId) {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch(`/api/v1/rules/${ruleId}`)
      currentRule.value = data
      return data
    } catch (e) {
      error.value = e.message || 'Failed to fetch rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new rule
   * @param {Object} ruleData - The rule data
   */
  async function createRule(ruleData) {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch('/api/v1/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData),
      })

      // Add to local state
      if (data) {
        rules.value.push(data)
      }

      return data
    } catch (e) {
      error.value = e.message || 'Failed to create rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing rule
   * @param {string} ruleId - The rule ID
   * @param {Object} updates - The fields to update
   */
  async function updateRule(ruleId, updates) {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch(`/api/v1/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      // Update local state
      const index = rules.value.findIndex(r => r.rule_id === ruleId)
      if (index !== -1 && data) {
        rules.value[index] = { ...rules.value[index], ...data }
      }

      return data
    } catch (e) {
      error.value = e.message || 'Failed to update rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete (soft-delete/deactivate) a rule
   * @param {string} ruleId - The rule ID
   */
  async function deleteRule(ruleId) {
    loading.value = true
    error.value = null

    try {
      await apiFetch(`/api/v1/rules/${ruleId}`, {
        method: 'DELETE',
      })

      // Remove from local state
      rules.value = rules.value.filter(r => r.rule_id !== ruleId)

      return true
    } catch (e) {
      error.value = e.message || 'Failed to delete rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset the state
   */
  function reset() {
    loading.value = false
    error.value = null
    rules.value = []
    currentRule.value = null
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    loading,
    error,
    rules,
    currentRule,

    // Computed
    objectiveRules,
    goalRules,
    rulesByCategory,

    // Methods
    listRules,
    fetchAllRules,
    getRule,
    createRule,
    updateRule,
    deleteRule,
    reset,
    clearError,
  }
}
