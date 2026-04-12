// __tests__/simple.test.js
describe('Test simple', () => {
  test('Jest fonctionne correctement', () => {
    expect(1 + 1).toBe(2);
  });

  test('Les strings fonctionnent', () => {
    expect('Hello').toBe('Hello');
  });

  test('Les arrays fonctionnent', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
