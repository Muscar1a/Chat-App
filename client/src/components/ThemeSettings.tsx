import { useState, useEffect } from 'react';
import { Card, Radio, Space, Typography, Button, message, ColorPicker } from 'antd';
import { MoonOutlined, SunOutlined, BgColorsOutlined } from '@ant-design/icons';
import type { ColorPickerProps } from 'antd';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

interface ThemeSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export default function ThemeSettings({ onUnsavedChanges }: ThemeSettingsProps) {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();  const [selectedTheme, setSelectedTheme] = useState(theme); // Theme được chọn nhưng chưa lưu
  const [selectedAccentColor, setSelectedAccentColor] = useState(accentColor); // Accent color được chọn nhưng chưa lưu
  const [originalMode, setOriginalMode] = useState(theme);
  const [originalAccentColor, setOriginalAccentColor] = useState(accentColor);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined colors for quick selection
  const presetColors = [
    '#1677ff', // Blue
    '#52c41a', // Green
    '#722ed1', // Purple
    '#fa8c16', // Orange
    '#ff4d4f', // Red
    '#13c2c2', // Teal
    '#eb2f96', // Pink
    '#f5222d', // Crimson
    '#fa541c', // Volcano
    '#faad14', // Gold
    '#2f54eb', // Geek Blue
  ];
  // Load saved theme when component mounts
  useEffect(() => {
    setOriginalMode(theme);
    setSelectedTheme(theme);
    setOriginalAccentColor(accentColor);
    setSelectedAccentColor(accentColor);
  }, [theme, accentColor]);

  // Theo dõi thay đổi để báo unsaved changes
  useEffect(() => {
    const hasChanges = selectedTheme !== originalMode || selectedAccentColor !== originalAccentColor;
    onUnsavedChanges(hasChanges);
  }, [selectedTheme, originalMode, selectedAccentColor, originalAccentColor, onUnsavedChanges]);  // Preview theme changes - áp dụng trực tiếp, không có cleanup
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const currentAccentColor = root.getAttribute("data-accent-color");
    
    // Chỉ cập nhật nếu theme thực sự khác
    if (currentTheme !== selectedTheme) {
      root.setAttribute("data-theme", selectedTheme);
    }
    
    // Cập nhật accent color
    if (currentAccentColor !== selectedAccentColor) {
      root.setAttribute("data-accent-color", selectedAccentColor);
    }
  }, [selectedTheme, selectedAccentColor]);const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));      // Apply the selected theme permanently
      setTheme(selectedTheme);
      setOriginalMode(selectedTheme);
      setAccentColor(selectedAccentColor);
      setOriginalAccentColor(selectedAccentColor);
      
      // Ensure DOM is updated
      const root = document.documentElement;
      root.setAttribute("data-theme", selectedTheme);
      root.setAttribute("data-accent-color", selectedAccentColor);
      
      message.success('Cài đặt giao diện đã được lưu!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setIsLoading(false);
    }
  };  const handleCancel = () => {
    setSelectedTheme(originalMode);
    setSelectedAccentColor(originalAccentColor);
    // Immediately restore the original theme and accent color
    const root = document.documentElement;
    root.setAttribute("data-theme", originalMode);
    root.setAttribute("data-accent-color", originalAccentColor);
  };
  const handleReset = () => {
    setSelectedTheme('light');
    setSelectedAccentColor('#1677ff');
  };
  // Sync with current theme when component becomes active again
  useEffect(() => {
    const currentDOMTheme = document.documentElement.getAttribute("data-theme");
    const currentDOMAccentColor = document.documentElement.getAttribute("data-accent-color");
    
    if (currentDOMTheme && currentDOMTheme !== selectedTheme && currentDOMTheme === theme) {
      // DOM theme matches context theme but differs from selected - sync up
      setSelectedTheme(theme);
      setOriginalMode(theme);
    }
    
    if (currentDOMAccentColor && currentDOMAccentColor !== selectedAccentColor && currentDOMAccentColor === accentColor) {
      // DOM accent color matches context accent color but differs from selected - sync up
      setSelectedAccentColor(accentColor);
      setOriginalAccentColor(accentColor);
    }
  }, [theme, selectedTheme, accentColor, selectedAccentColor]);

  return (
    <div className="theme-settings-container">      <div className="form-header">
        <Title level={2}>Cài đặt giao diện</Title>
        <Text type="secondary">Tùy chỉnh giao diện ứng dụng theo sở thích của bạn</Text>        {(selectedTheme !== originalMode || selectedAccentColor !== originalAccentColor) && (
          <div className="preview-notification">
            <div className="preview-icon">💡</div>
            <div className="preview-content">
              <strong>Đang xem trước</strong>
              <span>Nhấn "Lưu cài đặt" để áp dụng thay đổi này.</span>
            </div>
          </div>
        )}
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Theme Mode */}        <Card title={
          <Space>
            <MoonOutlined />
            <span>Chế độ giao diện</span>
          </Space>
        }>          <Radio.Group
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
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
            </Space>          </Radio.Group>        </Card>

        {/* Accent Color Selection */}
        <Card title={
          <Space>
            <BgColorsOutlined />
            <span>Màu chủ đạo</span>
          </Space>
        }>          <div style={{ marginBottom: '16px' }}>
            <Text>Chọn màu chủ đạo cho ứng dụng:</Text>
          </div>          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <ColorPicker
              value={selectedAccentColor}
              onChange={(color) => setSelectedAccentColor(color.toHexString())}
              presets={[
                {
                  label: 'Màu phổ biến',
                  colors: presetColors,
                },
              ]}
              size="large"
              showText
              format="hex"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: selectedAccentColor,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                }} 
              />
              <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                {selectedAccentColor.toUpperCase()}
              </Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedAccentColor(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: color,
                  border: selectedAccentColor === color ? '3px solid var(--text-primary)' : '2px solid #fff',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  transform: selectedAccentColor === color ? 'scale(1.1)' : 'scale(1)',
                }}
                title={color}
              />
            ))}
          </div>
        </Card>

        {/* Primary Color - Commented out for now
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
        */}

       
        {/* <Card title={
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
        <Card title="Chế độ gọn">
          <Space align="center">
            <Switch
              checked={extendedTheme.compactMode}
              onChange={(checked) => handleExtendedThemeChange('compactMode', checked)}
            />
            <Text>Kích hoạt chế độ gọn (giảm khoảng cách giữa các thành phần)</Text>
          </Space>
        </Card>*/}

        {/* <Divider /> */}        {/* Action Buttons */}
        <div className="theme-actions">
          <Space size="middle">            <Button 
              type="primary" 
              onClick={handleSave}
              loading={isLoading}
              disabled={selectedTheme === originalMode && selectedAccentColor === originalAccentColor}
              size="large"
            >
              Lưu cài đặt
            </Button>
            <Button 
              onClick={handleCancel}
              disabled={selectedTheme === originalMode && selectedAccentColor === originalAccentColor}
              size="large"
            >
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleReset}
              size="large"
              style={{ marginLeft: 'auto' }}
            >
              Đặt lại mặc định
            </Button>
          </Space>
        </div>
      </Space>
    </div>
  );
}