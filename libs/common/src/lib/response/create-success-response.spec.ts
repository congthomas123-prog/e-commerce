import { createSuccessResponse } from './create-success-response';

describe('createSuccessResponse', () => {
  it('returns the standard success envelope', () => {
    expect(
      createSuccessResponse(
        { id: 'user-1' },
        { message: 'Created', meta: { requestId: 'req-1' } },
      ),
    ).toEqual({
      success: true,
      message: 'Created',
      data: { id: 'user-1' },
      meta: { requestId: 'req-1' },
    });
  });
});
