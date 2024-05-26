import { Markup } from 'telegraf';
import { TelegramAuthData, tgChannelData } from '../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../utils/auth';
import {
  AddDuelOpponent,
  CreateDuel,
  FinishDuel,
  GetDuelDataByInviter,
  GetDuelDataByUser,
  GetWatchingChannels,
  SetPersonalData,
} from '../database/telegram';
import { duel_lifetime } from '../config';
import { startHandler, duelHandler, duelAcceptHandler } from './handlers';
import { TestStartHandler } from './handlers/test';
import { StartHandler } from './handlers/start';
import { duelText, startText, tg_token } from './constants';
import { bot } from './bot';
import { DuelCreationHandler } from './handlers/duelCreate';
import { DuelAcceptHandler } from './handlers/duelAccept';


export function TelegramBotLaunch() {
  bot.onText(/\/start/, async (msg) => {
    console.log("Start called");
    await  StartHandler(bot, msg);
  });

  bot.onText(/\/start (.+)/, async (msg, match) => {
    console.log("Duel accept called");
    await  DuelAcceptHandler(bot, msg, match);
  });

  bot.onText(/\/duel/, duelHandler);

  bot.on('inline_query', async (query) => {
    const deepLink = `https://t.me/${
      process.env.TELEGRAM_BOT_NAME
    }?start=${query.from.username?.replace(' ', '')}`;

    console.log('Query info: ', query);

    const results = [
      {
        type: 'article',
        id: '1',
        title: 'Send invitation message',
        input_message_content: {
          message_text: `Duel call from ${query.from.first_name} ${
            query.from.last_name || ''
          }`,
          parse_mode: 'Markdown',
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Confirm invitation', url: deepLink }], //callback_data: metadataString
          ],
        },
        cache_time: 0,
      },
    ];

    await bot.answerInlineQuery(query.id, results);
    return;
  });

  bot.on('callback_query', async (query) => {
    console.log(query);
    switch (query.data) {
      case "duel":
        await DuelCreationHandler (bot, query.message);
        break;
    }
  });

  bot.on('message', async (query) => {
    console.log("Received: ", query.text);
    const txt: string = query.text;
    switch (txt) {
      case startText:
        console.log("Case 1")
        await startHandler(query);
        break;
      case duelText:
        console.log("Case 3")
        await duelHandler(query);
        break;
      /* default:
        console.log("Case 5")
        bot.sendMessage(
          query.chat.id,
          `Command not resolved, text: ${query.text}`
        );
        console.log("Unresolved message: ", query.text); */
    }
    console.log("Query processed: ", query.text);
  });

  bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
  });

  bot.on('webhook_error', (error) => {
    console.error('Webhook error:', error);
  });

  bot.on('error', (error) => {
    console.error('Bot error:', error);
  });
}
