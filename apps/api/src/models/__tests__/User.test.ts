import { UserModel } from '../User';
import { ActivityLevel, GoalType, GoalStatus } from '../../types/shared';

describe('UserModel', () => {
  describe('驗證功能', () => {
    describe('validateRegistration', () => {
      it('應該驗證有效的註冊資料', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!'
        };

        const { error, value } = UserModel.validateRegistration(validData);

        expect(error).toBeUndefined();
        expect(value).toEqual(validData);
      });

      it('應該拒絕無效的電子郵件', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'Password123!'
        };

        const { error } = UserModel.validateRegistration(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('請輸入有效的電子郵件地址');
      });

      it('應該拒絕弱密碼', () => {
        const weakPasswordData = {
          email: 'test@example.com',
          password: '123456'
        };

        const { error } = UserModel.validateRegistration(weakPasswordData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('密碼必須包含大小寫字母、數字和特殊字符');
      });

      it('應該拒絕過短的密碼', () => {
        const shortPasswordData = {
          email: 'test@example.com',
          password: 'Abc1!'
        };

        const { error } = UserModel.validateRegistration(shortPasswordData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('密碼至少需要8個字符');
      });

      it('應該要求必填欄位', () => {
        const incompleteData = {
          email: 'test@example.com'
          // 缺少 password
        };

        const { error } = UserModel.validateRegistration(incompleteData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('密碼為必填欄位');
      });
    });

    describe('validateProfile', () => {
      it('應該驗證有效的用戶檔案', () => {
        const validProfile = {
          name: '張三',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 70,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const { error, value } = UserModel.validateProfile(validProfile);

        expect(error).toBeUndefined();
        expect(value).toEqual(validProfile);
      });

      it('應該拒絕無效的年齡', () => {
        const invalidProfile = {
          name: '張三',
          age: 200, // 無效年齡
          gender: 'male' as const,
          height: 175,
          weight: 70,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const { error } = UserModel.validateProfile(invalidProfile);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('年齡不能超過150');
      });

      it('應該拒絕無效的性別', () => {
        const invalidProfile = {
          name: '張三',
          age: 30,
          gender: 'invalid' as any,
          height: 175,
          weight: 70,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const { error } = UserModel.validateProfile(invalidProfile);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('性別必須是 male、female 或 other');
      });

      it('應該拒絕無效的身高', () => {
        const invalidProfile = {
          name: '張三',
          age: 30,
          gender: 'male' as const,
          height: 30, // 過低的身高
          weight: 70,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const { error } = UserModel.validateProfile(invalidProfile);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('身高不能小於50公分');
      });

      it('應該拒絕無效的體重', () => {
        const invalidProfile = {
          name: '張三',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 600, // 過高的體重
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const { error } = UserModel.validateProfile(invalidProfile);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('體重不能超過500公斤');
      });
    });

    describe('validateHealthGoal', () => {
      it('應該驗證有效的健康目標', () => {
        const validGoal = {
          type: GoalType.WEIGHT_LOSS,
          target: 65,
          current: 70,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
          status: GoalStatus.ACTIVE
        };

        const { error, value } = UserModel.validateHealthGoal(validGoal);

        expect(error).toBeUndefined();
        expect(value?.type).toBe(GoalType.WEIGHT_LOSS);
        expect(value?.target).toBe(65);
      });

      it('應該拒絕過去的截止日期', () => {
        const invalidGoal = {
          type: GoalType.WEIGHT_LOSS,
          target: 65,
          current: 70,
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
          status: GoalStatus.ACTIVE
        };

        const { error } = UserModel.validateHealthGoal(invalidGoal);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('截止日期必須是未來的日期');
      });

      it('應該拒絕負數目標值', () => {
        const invalidGoal = {
          type: GoalType.WEIGHT_LOSS,
          target: -5, // 負數目標
          current: 70,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: GoalStatus.ACTIVE
        };

        const { error } = UserModel.validateHealthGoal(invalidGoal);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('目標值必須為正數');
      });
    });
  });

  describe('序列化功能', () => {
    describe('serialize', () => {
      it('應該移除敏感資訊', () => {
        const userData = {
          id: '123',
          email: 'test@example.com',
          password_hash: 'hashed_password',
          profile: {
            name: '張三',
            age: 30,
            gender: 'male',
            height: 175,
            weight: 70,
            activityLevel: ActivityLevel.MODERATELY_ACTIVE
          },
          healthGoals: [],
          created_at: new Date(),
          updated_at: new Date()
        };

        const serialized = UserModel.serialize(userData);

        expect(serialized).not.toHaveProperty('password');
        expect(serialized).not.toHaveProperty('password_hash');
        expect(serialized).toHaveProperty('id');
        expect(serialized).toHaveProperty('email');
        expect(serialized).toHaveProperty('profile');
        expect(serialized).toHaveProperty('preferences');
        expect(serialized).toHaveProperty('healthGoals');
      });

      it('應該提供預設偏好設定', () => {
        const userData = {
          id: '123',
          email: 'test@example.com',
          created_at: new Date(),
          updated_at: new Date()
        };

        const serialized = UserModel.serialize(userData);

        expect(serialized.preferences).toBeDefined();
        expect(serialized.preferences.language).toBe('zh-TW');
        expect(serialized.preferences.timezone).toBe('Asia/Taipei');
        expect(serialized.preferences.notifications.email).toBe(true);
        expect(serialized.preferences.privacy.dataSharing).toBe(false);
      });
    });

    describe('serializeProfile', () => {
      it('應該正確序列化用戶檔案', () => {
        const profileData = {
          name: '張三',
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activity_level: 'moderately_active'
        };

        const serialized = UserModel.serializeProfile(profileData);

        expect(serialized.name).toBe('張三');
        expect(serialized.age).toBe(30);
        expect(serialized.gender).toBe('male');
        expect(serialized.height).toBe(175);
        expect(serialized.weight).toBe(70);
        expect(serialized.activityLevel).toBe('moderately_active');
      });
    });

    describe('serializeHealthGoal', () => {
      it('應該正確序列化健康目標', () => {
        const goalData = {
          id: '456',
          type: 'weight_loss',
          target: 65,
          current_value: 70,
          deadline: new Date('2024-12-31'),
          status: 'active'
        };

        const serialized = UserModel.serializeHealthGoal(goalData);

        expect(serialized.id).toBe('456');
        expect(serialized.type).toBe('weight_loss');
        expect(serialized.target).toBe(65);
        expect(serialized.current).toBe(70);
        expect(serialized.deadline).toEqual(new Date('2024-12-31'));
        expect(serialized.status).toBe('active');
      });
    });
  });

  describe('計算功能', () => {
    describe('calculateBMI', () => {
      it('應該正確計算 BMI', () => {
        const bmi = UserModel.calculateBMI(175, 70);
        expect(bmi).toBe(22.9); // 70 / (1.75^2) = 22.857... ≈ 22.9
      });

      it('應該處理邊界情況', () => {
        expect(UserModel.calculateBMI(0, 70)).toBeNaN();
        expect(UserModel.calculateBMI(175, 0)).toBe(0);
      });
    });

    describe('calculateBMR', () => {
      it('應該正確計算男性 BMR', () => {
        const profile = {
          name: '張三',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 70,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const bmr = UserModel.calculateBMR(profile);
        // 10 * 70 + 6.25 * 175 - 5 * 30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75 ≈ 1649
        expect(bmr).toBe(1649);
      });

      it('應該正確計算女性 BMR', () => {
        const profile = {
          name: '李四',
          age: 25,
          gender: 'female' as const,
          height: 160,
          weight: 55,
          activityLevel: ActivityLevel.LIGHTLY_ACTIVE
        };

        const bmr = UserModel.calculateBMR(profile);
        // 10 * 55 + 6.25 * 160 - 5 * 25 - 161 = 550 + 1000 - 125 - 161 = 1264
        expect(bmr).toBe(1264);
      });
    });

    describe('calculateTDEE', () => {
      it('應該正確計算 TDEE', () => {
        const profile = {
          name: '張三',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 70,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
        };

        const tdee = UserModel.calculateTDEE(profile);
        const expectedBMR = 1649;
        const expectedTDEE = Math.round(expectedBMR * 1.55); // 2556
        expect(tdee).toBe(expectedTDEE);
      });

      it('應該根據不同活動水平計算不同的 TDEE', () => {
        const baseProfile = {
          name: '張三',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 70,
          activityLevel: ActivityLevel.SEDENTARY
        };

        const sedentaryTDEE = UserModel.calculateTDEE(baseProfile);
        
        const activeTDEE = UserModel.calculateTDEE({
          ...baseProfile,
          activityLevel: ActivityLevel.VERY_ACTIVE
        });

        expect(activeTDEE).toBeGreaterThan(sedentaryTDEE);
      });
    });

    describe('validateGoalReasonableness', () => {
      const profile = {
        name: '張三',
        age: 30,
        gender: 'male' as const,
        height: 175,
        weight: 70,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE
      };

      it('應該接受合理的減重目標', () => {
        const goal = {
          id: '1',
          type: GoalType.WEIGHT_LOSS,
          target: 65,
          current: 70,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, profile);
        expect(result.isValid).toBe(true);
      });

      it('應該拒絕過低 BMI 用戶的減重目標', () => {
        const thinProfile = {
          ...profile,
          weight: 50 // BMI ≈ 16.3 (過低)
        };

        const goal = {
          id: '1',
          type: GoalType.WEIGHT_LOSS,
          target: 45,
          current: 50,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, thinProfile);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('BMI已經偏低');
      });

      it('應該拒絕不合理的減重目標值', () => {
        const goal = {
          id: '1',
          type: GoalType.WEIGHT_LOSS,
          target: 80, // 目標比當前體重高
          current: 70,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, profile);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('減重目標不能高於當前體重');
      });

      it('應該接受合理的增重目標', () => {
        const goal = {
          id: '1',
          type: GoalType.WEIGHT_GAIN,
          target: 75,
          current: 70,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, profile);
        expect(result.isValid).toBe(true);
      });

      it('應該拒絕過高 BMI 用戶的增重目標', () => {
        const heavyProfile = {
          ...profile,
          weight: 120 // BMI ≈ 39.2 (過高)
        };

        const goal = {
          id: '1',
          type: GoalType.WEIGHT_GAIN,
          target: 125,
          current: 120,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, heavyProfile);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('BMI已經偏高');
      });

      it('應該接受合理的維持目標', () => {
        const goal = {
          id: '1',
          type: GoalType.MAINTENANCE,
          target: 71,
          current: 70,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, profile);
        expect(result.isValid).toBe(true);
      });

      it('應該拒絕偏離太多的維持目標', () => {
        const goal = {
          id: '1',
          type: GoalType.MAINTENANCE,
          target: 75, // 偏離當前體重超過2公斤
          current: 70,
          deadline: new Date(),
          status: GoalStatus.ACTIVE
        };

        const result = UserModel.validateGoalReasonableness(goal, profile);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('維持體重目標應該接近當前體重');
      });
    });
  });
});