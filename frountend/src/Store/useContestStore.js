// src/store/useContestStore.js
import { create } from 'zustand'
import axios from 'axios'

const useContestStore = create((set) => ({
  loading: false,
  joinResult: null,
  error: null,

joinContest: async (contestId, token) => {
  set({ loading: true, error: null, joinResult: null })

  try {
    const res = await axios.post(
      'http://localhost:5000/join',
      { contestId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    set({ joinResult: res.data, loading: false })
    console.log({joinResult: res.data})
  } catch (err) {
    set({
      error: err.response?.data?.message || 'Something went wrong',
      loading: false,
    })
  }
},
}))

export default useContestStore
