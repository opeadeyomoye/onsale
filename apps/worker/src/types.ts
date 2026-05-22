import type { Context } from 'hono'

export type HonoContext = Context<AppEnv>
/*
type TelegramWebhookPayload = {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      type: 'private' | 'group' | 'supergroup' | 'channel'
    }
    date: number
    text?: string
    entities?: Array<{
      offset: number
      length: number
      type: 'mention' | 'hashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'pre' | 'text_link' | 'custom_emoji'
    }>
    reply_markup?: {
      inline_keyboard?: Array<Array<{
        text: string
        url?: string
        callback_data?: string
        switch_inline_query?: string
        switch_inline_query_current_chat?: string
        pay?: boolean
      }>>
      remove_keyboard?: boolean
      force_reply?: boolean
      selective?: boolean
    }
    audio?: {
      file_id: string
      duration: number
      performer?: string
      title?: string
      mime_type?: string
      file_size?: number
    }
    document?: {
      file_id: string
      thumb?: {
        file_id: string
        file_unique_id: string
        file_size: number
        width: number
        height: number
      }
      file_name?: string
      mime_type?: string
      file_size?: number
    } | {
      file_id: string
      thumb?: {
        file_id: string
        file_unique_id: string
        file_size: number
        width: number
        height: number
      }
      file_name?: string
      mime_type?: string
      file_size?: number
    }
    photo?: Array<{
      file_id: string
      file_unique_id: string
      width: number
      height: number
      file_size?: number
    }>
    voice?: {
      file_id: string
      duration: number
      mime_type?: string
      file_size?: number
    }
    video?: {
      file_id: string
      width: number
      height: number
      duration: number
      thumb?: {
        file_id: string
        file_unique_id: string
        file_size: number
        width: number
        height: number
      }
      mime_type?: string
      file_size?: number
    }
  }
  edited_message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      type: 'private' | 'group' | 'supergroup' | 'channel'
    }
    date: number
    text?: string
    entities?: Array<{
      offset: number
      length: number
      type: 'mention' | 'hashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'pre' | 'text_link' | 'custom_emoji'
    }>
    reply_markup?: {
      inline_keyboard?: Array<Array<{
        text: string
        url?: string
        callback_data?: string
        switch_inline_query?: string
        switch_inline_query_current_chat?: string
        pay?: boolean
      }>>
      remove_keyboard?: boolean
      force_reply?: boolean
      selective?: boolean
    }
  }
}
*/
