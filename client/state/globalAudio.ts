import { reactive } from 'vue'

export default reactive({
  currentRecId: undefined,
  isPlaying: false,
  isLoading: false,
} as {
  currentRecId?: string,
  isPlaying: boolean,
  isLoading: boolean,
})
