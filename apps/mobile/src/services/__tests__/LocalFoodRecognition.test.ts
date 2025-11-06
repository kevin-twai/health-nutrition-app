import { localFoodRecognition } from '../LocalFoodRecognition';

describe('LocalFoodRecognitionService', () => {
  it('should recognize food from filename with curry keywords', async () => {
    const result = await localFoodRecognition.recognizeFood('file:///path/to/curry_rice.jpg');
    
    expect(result.foods.length).toBeGreaterThan(0);
    expect(result.foods[0].name).toContain('咖喱');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.processingTime).toBeGreaterThan(0);
  });

  it('should recognize food from filename with noodle keywords', async () => {
    const result = await localFoodRecognition.recognizeFood('file:///path/to/ramen_soup.jpg');
    
    expect(result.foods.length).toBeGreaterThan(0);
    expect(result.foods[0].name).toContain('拉麵');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should return default food when no keywords match', async () => {
    const result = await localFoodRecognition.recognizeFood('file:///path/to/unknown_food.jpg');
    
    expect(result.foods.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should handle empty or invalid URIs gracefully', async () => {
    const result = await localFoodRecognition.recognizeFood('');
    
    expect(result.foods.length).toBeGreaterThan(0); // Should return default food
    expect(result.confidence).toBeGreaterThan(0);
  });
});