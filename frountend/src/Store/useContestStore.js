  import { create } from 'zustand'
  import axios from 'axios'


const useContestStore = create((set) => ({
  loading: false,
  joinResult: null,
  completeResult: null,
  walletBalance: null,
  error: null,

  // ✅ Join Contest API
  joinContest: async (contestId, token) => {
    set({ loading: true, error: null, joinResult: null })
    try {
      const res = await axios.post(
        `https://foodenergy.shop/v1/join`,
        { contestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      set({ joinResult: res.data, loading: false })
      console.log({ joinResult: res.data })

      await useContestStore.getState().getWalletBalance(token)

    } catch (err) {
      set({
        error: err.response?.data?.message || 'Something went wrong',
        loading: false,
      })
    }
  },

  // ✅ Get Wallet Balance
  getWalletBalance: async (token) => {
    try {
      const res = await axios.get(`https://foodenergy.shop/v1/wallet/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ walletBalance: res.data.balance });
      console.log("🪙 Wallet Balance Updated:", res.data.balance);
    } catch (err) {
      console.error("❌ Error fetching wallet:", err);
      set({ error: "Failed to fetch wallet balance" });
    }
  },

  // ✅ Complete contest API
  completeContest: async (contestId, token) => {
    set({ loading: true, error: null, completeResult: null })
    try {
      const res = await axios.post(
        `https://foodenergy.shop/v1/contest/complete/${contestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      set({ completeResult: res.data, loading: false })
      console.log({ completeResult: res.data })

      await useContestStore.getState().getWalletBalance(token)

    } catch (err) {
      set({
        error: err.response?.data?.message || 'Something went wrong',
        loading: false,
      })
    }
  },
}))

export default useContestStore