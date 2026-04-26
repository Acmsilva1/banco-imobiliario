import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { BankService } from './features/bank/bank.service.js';
import { TransferPayload } from './features/bank/bank.types.js';

const fastify = Fastify({ logger: true });
const bankService = new BankService();

fastify.register(fastifyIO, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

fastify.ready(err => {
  if (err) throw err;

  fastify.io.on('connection', (socket) => {
    socket.on('join_room', async (partidaId: string) => {
      socket.join(partidaId);
      const state = await bankService.getGameState(partidaId);
      socket.emit('sync_state', state);
    });

    socket.on('exec_transfer', async (payload: TransferPayload) => {
      try {
        const newState = await bankService.transfer(payload);
        fastify.io.to(payload.partidaId).emit('sync_state', newState);
      } catch (error: any) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('adjust_balance', async (data: { playerId: string, amount: number, label: string, partidaId: string }) => {
      try {
        const newState = await bankService.adjustBalance(data.playerId, data.amount, data.label, data.partidaId);
        fastify.io.to(data.partidaId).emit('sync_state', newState);
      } catch (error: any) {
        socket.emit('error_message', error.message);
      }
    });
  });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
