const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const config = require('./config.json');

const api = new TelegramBot(config.TELEGRAM_BOT_TOKEN, {polling: true});

// Текущие данные
let descriptionText = "📌 *Описание клана* 🔍\nЗдесь находится вся необходимая информация.";
let criteriaText = "💥 *Критерии вступления* ✨\nДолжна быть проявлена активность и желание играть командно.";

// Простая стартовая команда
api.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const keyboard = [
    [{
      text: 'Правила и Критерии',
      callback_data: 'criteria'
    }, {
      text: 'Присоединиться',
      callback_data: 'join'
    }]
  ];
  const options = {
    reply_markup: JSON.stringify({ inline_keyboard: keyboard })
  };
  await api.sendMessage(chatId, descriptionText, Object.assign({}, options, { parse_mode: 'Markdown' }));
});

// Ответ на выбор опции меню
api.onCallbackQuery(async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  if (data === 'criteria') {
    await api.answerCallbackQuery(callbackQuery.id);
    await api.editMessageText(`${criteriaText}\nХотите присоединиться?`, {
chat_id: chatId,
message_id: messageId
});
  } else if (data === 'join') {
    await api.answerCallbackQuery(callbackQuery.id);
    await api.editMessageText("Напишите ваше короткое представление и причину вступления:", {
chat_id: chatId,
message_id: messageId
      
    });


// Прием и обработка заявки
api.onText(/^(?!^\/[a-zA-Z]+).*$/, async (msg) => {
  const chatId = msg.chat.id;
  const userApplicant = msg.from;
  const adminChatId = Number(config.ADMIN_CHAT_ID);

  const applicantMessage = `
Заявка от @${userApplicant.username || userApplicant.first_name} (${userApplicant.id})

Сообщение заявителя:
*${msg.text.trim()}*
`;

  await api.sendMessage(adminChatId, applicantMessage, { parse_mode: 'Markdown' });
  await api.sendMessage(chatId, "Спасибо за заявку! Ваша заявка принята и скоро будет рассмотрена.");
});

// Команда для изменения описания
api.onText(/\/change_description (.+)/, async (msg, match) => {
  descriptionText = match[1];
  await api.sendMessage(msg.chat.id, "Описание обновлено!");
   
// Команда для изменения критериев
api.onText(/\/change_criteria (.+)/, async (msg, match) => {
  criteriaText = match[1];
  await api.sendMessage(msg.chat.id, "Критерии обновлены!");
});
