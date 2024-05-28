import TelegramBot from 'node-telegram-bot-api';
import {
  AddDuelOpponent,
  FinishDuel,
  GetDuelDataByUser,
  GetOpponent,
  GetPersonalDataByUsername,
  RemoveDuelOpponent,
} from '../../database/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';
import { InlineKeyboard } from './keyboard';
import { SendMessageWithSave } from './utils';

export const duelCancelAction = async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
  if (!query.message?.chat.id) {
    console.log('Chat not found');
    return;
  }
  const chatId = query.message.chat.id
  const sender: string = query?.message?.from?.username || '';
  if (sender) {
    const duel = await GetDuelDataByUser(sender.toLowerCase());
    if (duel) {
      await FinishDuel(duel.duel_id, '');
      SendMessageWithSave(bot, chatId, messages.duelCancelled, {
        reply_markup: InlineKeyboard(['duel']),
      })
    } else {
      SendMessageWithSave(bot, chatId, messages.duelNotFound);
    }
  } else {
    SendMessageWithSave(bot, chatId, messages.duelNotFound);
  }
};

export const duelAcceptAction = async (bot: TelegramBot, query: TelegramBot.CallbackQuery, inviter?: string) => {
  if (!query.message?.chat.id) {
    console.log('Chat not found');
    return;
  }
  const duel = await GetDuelDataByUser(inviter?.toLowerCase() || '');
  if (!duel) {
    bot.sendMessage(query.message.chat.id, messages.duelNotFound);
    return;
  }
  const player = query?.message?.from?.username || '';

  if (!player) {
    bot.sendMessage(query.message.chat.id, messages.noUsername);
    return;
  }

  await AddDuelOpponent(duel.duel_id, player);
  bot.sendMessage(query.message.chat.id, messages.duelComfirmed);
};

export const duelRefuseAction = async (bot: TelegramBot, query, inviter: string) => {
  if (!query.message.chat.id) {
    console.log('Chat not found');
    return;
  }
  const caller = query.from.username.toLowerCase();
  console.log("Duel cancelled between: ", caller, inviter);
  const duelOpponent = await GetOpponent(caller) || inviter;
  const opponentData = await GetPersonalDataByUsername(duelOpponent);

  if (opponentData) {
    SendMessageWithSave(bot, opponentData.chat_id, `Duel with ${query.from.username} cancelled by him`);
  }
  const removeResult = await RemoveDuelOpponent (caller);

  SendMessageWithSave (bot, query.message.chat.id, messages.duelRefused);
};
