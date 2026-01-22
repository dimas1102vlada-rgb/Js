const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const config = require('./config.json');

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

// Текущие текстовые данные
let descriptionText = "📌 *Описание клана* 🔍\nЗдесь расположена вся важная информация.";
let criteriaText = "💥 *Критерии вступления* ✨\nНеобходимо проявить активность и желание играть командно.";

// Стартовая команда
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const keyboard = [
    [{ text: 'Правила и критерии', callback_data: 'rules' }],
    [{ text: 'Подать заявку', callback_data: 'apply' }]
  ];

  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard
    }),
    parse_mode: 'Markdown'
  };

  await bot.sendMessage(chatId, descriptionText, options);
});

// Обработка callback-запросов (реакция на нажатие кнопок)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  switch(data) {
    case 'rules':
      await bot.answerCallbackQuery(callbackQuery.id); // Подтверждение получения запроса
      await bot.editMessageText(`${criteriaText}\nХотите вступить?`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown'
      });
      break;
    case 'apply':
      await bot.answerCallbackQuery(callbackQuery.id); // Подтверждение получения запроса
      await bot.editMessageText("Напишите ваше короткое представление и причину вступления:", {
        chat_id: chatId,
        message_id: messageId
      });
      break;
  }
});

// Обработка заявки на вступление
bot.onText(/^(?!\/)\S.*$/, async (msg) => {
  const chatId = msg.chat.id;
  const userApplicant = msg.from;
  const adminChatId = Number(config.ADMIN_CHAT_ID);

  const applicantMessage = `
🎟️ Новая заявка на вступление\n
От кого: @${userApplicant.username || userApplicant.first_name} (${userApplicant.id})\n
Содержание:\n*${msg.text.trim()}*
`;

  await bot.sendMessage(adminChatId, applicantMessage, { parse_mode: 'Markdown' });
  await bot.sendMessage(chatId, "✅ Спасибо за заявку! Она передана администрации.");
});

// Команда для изменения описания
bot.onText(/\/change_description (.+)/, async (msg, match) => {
  descriptionText = match[1];
  await bot.sendMessage(msg.chat.id, "Описание обновлено!");
});

// Команда для изменения критериев
bot.onText(/\/change_criteria (.+)/, async (msg, match) => {
  criteriaText = match[1];
  await bot.sendMessage(msg.chat.id, "Критерии обновлены!");
});

// Информация о запуске бота
console.log("Телеграм-бот запущен...");

// Функция для безопасной сериализации объекта
const safeStringify = (obj) => {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'object' && value !== null ? '[Circular]' : value
  );
};

// Наш объект с рекурсивной ссылкой
const complexObject = {
  id: 1,
  parent: {
    child: null
  }
};
complexObject.parent.child = complexObject; // Рекурсивная ссылка

// Пример использования
try {
  console.log(safeStringify(complexObject));
} catch(err) {
  console.error("Ошибка сериализации объекта:", err);
}
