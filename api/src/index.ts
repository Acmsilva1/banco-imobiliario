import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { BankService } from './features/bank/bank.service.js';
import type { TransferPayload } from './features/bank/bank.types.js';
import type { Socket } from 'socket.io';

const app = fastify({ logger: true });
const bankService = new BankService();

app.register(fastifyIO, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.ready((err: Error | null) => {
  if (err) throw err;

  app.io.on('connection', (socket: Socket) => {
    socket.on('join_room', async (partidaId: string) => {
      socket.join(partidaId);
      (socket as any).partidaId = partidaId;
      await bankService.incrementPlayerCount(partidaId);
      const state = await bankService.getGameState(partidaId);
      socket.emit('sync_state', state);
    });

    socket.on('disconnect', async () => {
      const partidaId = (socket as any).partidaId;
      if (partidaId) {
        await bankService.decrementPlayerCount(partidaId);
      }
    });

    socket.on('exec_transfer', async (payload: TransferPayload) => {
      try {
        const newState = await bankService.transfer(payload);
        app.io.to(payload.partidaId).emit('sync_state', newState);
      } catch (error: any) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('adjust_balance', async (data: { playerId: string, amount: number, label: string, partidaId: string }) => {
      try {
        const newState = await bankService.adjustBalance(data.playerId, data.amount, data.label, data.partidaId);
        app.io.to(data.partidaId).emit('sync_state', newState);
      } catch (error: any) {
        socket.emit('error_message', error.message);
      }
    });
  });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err: any) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
