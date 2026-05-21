describe('main bootstrap', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.PORT;
  });

  it('uses port 3002 by default', async () => {
    const listen = jest.fn().mockResolvedValue(undefined);
    const setGlobalPrefix = jest.fn();
    const useGlobalPipes = jest.fn();
    const useGlobalFilters = jest.fn();

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: jest.fn().mockResolvedValue({
          setGlobalPrefix,
          useGlobalPipes,
          useGlobalFilters,
          listen,
        }),
      },
    }));

    await jest.isolateModulesAsync(async () => {
      await import('./main.js');
    });

    expect(setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(useGlobalFilters).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledWith(3002);
  });
});
