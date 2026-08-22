import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function setCommands() {
  const response = await fetch(`https://api.telegram.org/bot${TOKEN}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'start', description: 'Открыть меню управления' },
        { command: 'list', description: 'Список получателей' },
        { command: 'listadmins', description: 'Список администраторов' }
      ]
    })
  });
  
  const result = await response.json();
  console.log(result);
}

setCommands();
