import { useState, useEffect } from 'react';
import { Card, Radio, Switch, Slider, ColorPicker, Divider, Space, Typography, Button, message } from 'antd';
import { BgColorsOutlined, FontSizeOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import type { ColorPickerProps } from 'antd';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

interface ThemeSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

interface ExtendedThemeConfig {
  primaryColor: string;
  fontSize: number;
  borderRadius: number;
  compactMode: boolean;
}

const defaultExtendedTheme: ExtendedThemeConfig = {
  primaryColor: '#1677ff',
  fontSize: 14,
  borderRadius: 6,
  compactMode: false,
};

export default function ThemeSettings({ onUnsavedChanges }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [extendedTheme, setExtendedTheme] = useState<ExtendedThemeConfig>(defaultExtendedTheme);
  const [originalTheme, setOriginalTheme] = useState<ExtendedThemeConfig>(defaultExtendedTheme);
  const [originalMode, setOriginalMode] = useState(theme);
  const [isLoading, setIsLoading] = useState(false);

  // Load extended theme từ localStorage khi component mount
  useEffect(() => {
    const savedExtendedTheme = localStorage.getItem('app-extended-theme');
    if (savedExtendedTheme) {
      try {
        const parsed = JSON.parse(savedExtendedTheme);
        setExtendedTheme(parsed);
        setOriginalTheme(parsed);
        applyExtendedTheme(parsed);
      } catch (error) {
        console.error('Error parsing saved extended theme:', error);
      }
    }
    setOriginalMode(theme);
  }, [theme]);

  // Theo dõi thay đổi để báo unsaved changes
  useEffect(() => {
    const hasChanges = 
      JSON.stringify(extendedTheme) !== JSON.stringify(originalTheme) ||
      theme !== originalMode;
    onUnsavedChanges(hasChanges);
  }, [extendedTheme, originalTheme, theme, originalMode, onUnsavedChanges]);

  const applyExtendedTheme = (themeConfig: ExtendedThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--primary-color', themeConfig.primaryColor);
    root.style.setProperty('--font-size-base', `${themeConfig.fontSize}px`);
    root.style.setProperty('--border-radius-base', `${themeConfig.borderRadius}px`);
    
    // Apply compact mode
    if (themeConfig.compactMode) {
      root.classList.add('ant-compact');
    } else {
      root.classList.remove('ant-compact');
    }
  };

  const handleExtendedThemeChange = (key: keyof ExtendedThemeConfig, value: any) => {
    const newTheme = { ...extendedTheme, [key]: value };
    setExtendedTheme(newTheme);
    applyExtendedTheme(newTheme);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('app-extended-theme', JSON.stringify(extendedTheme));
      setOriginalTheme(extendedTheme);
      setOriginalMode(theme);
      message.success('Cài đặt giao diện đã được lưu!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExtendedTheme(defaultExtendedTheme);
    applyExtendedTheme(defaultExtendedTheme);
    setTheme('light');
  };

  const colorPickerProps: ColorPickerProps = {
    showText: true,
    size: 'small',
  };

  return (
    <div className="theme-settings-container">
      <div className="form-header">
        <Title level={2}>Cài đặt giao diện</Title>
        <Text type="secondary">Tùy chỉnh giao diện ứng dụng theo sở thích của bạn</Text>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Theme Mode */}
        <Card title={
          <Space>
            <MoonOutlined />
            <span>Chế độ giao diện</span>
          </Space>
        }>
          <Radio.Group
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical">
              <Radio value="light">
                <Space>
                  <SunOutlined />
                  <span>Sáng</span>
                </Space>
              </Radio>
              <Radio value="dark">
                <Space>
                  <MoonOutlined />
                  <span>Tối</span>
                </Space>
              </Radio>
              <Radio value="system">
                <Space>
                  <BgColorsOutlined />
                  <span>Tự động (theo hệ thống)</span>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Card>

        {/* Primary Color */}
        <Card title={
          <Space>
            <BgColorsOutlined />
            <span>Màu chủ đạo</span>
          </Space>
        }>
          <Space align="center">
            <Text>Chọn màu chủ đạo cho ứng dụng:</Text>
            <ColorPicker
              {...colorPickerProps}
              value={extendedTheme.primaryColor}
              onChange={(color) => handleExtendedThemeChange('primaryColor', color.toHexString())}
            />
          </Space>
        </Card>

        {/* Font Size */}
        <Card title={
          <Space>
            <FontSizeOutlined />
            <span>Kích thước chữ</span>
          </Space>
        }>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Kích thước chữ cơ bản: {extendedTheme.fontSize}px</Text>
            <Slider
              min={12}
              max={18}
              value={extendedTheme.fontSize}
              onChange={(value) => handleExtendedThemeChange('fontSize', value)}
              marks={{
                12: '12px',
                14: '14px',
                16: '16px',
                18: '18px',
              }}
            />
          </Space>
        </Card>

        {/* Border Radius */}
        <Card title="Bo góc">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Độ bo góc: {extendedTheme.borderRadius}px</Text>
            <Slider
              min={0}
              max={12}
              value={extendedTheme.borderRadius}
              onChange={(value) => handleExtendedThemeChange('borderRadius', value)}
              marks={{
                0: '0px',
                4: '4px',
                8: '8px',
                12: '12px',
              }}
            />
          </Space>
        </Card>

        {/* Compact Mode */}
        <Card title="Chế độ gọn">
          <Space align="center">
            <Switch
              checked={extendedTheme.compactMode}
              onChange={(checked) => handleExtendedThemeChange('compactMode', checked)}
            />
            <Text>Kích hoạt chế độ gọn (giảm khoảng cách giữa các thành phần)</Text>
          </Space>
        </Card>

        <Divider />

        {/* Action Buttons */}
        <Space>
          <Button 
            type="primary" 
            onClick={handleSave}
            loading={isLoading}
          >
            Lưu cài đặt
          </Button>
          <Button onClick={handleReset}>
            Đặt lại mặc định
          </Button>
        </Space>
      </Space>
    </div>
  );
}