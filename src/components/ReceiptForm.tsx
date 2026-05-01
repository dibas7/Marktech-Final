import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCreateReceipt } from '@/hooks/useReceipts';
import { Loader2, Save, User, Laptop, Eye, EyeOff, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { CustomerAutocomplete } from '@/components/CustomerAutocomplete';
import { useRef, useState, KeyboardEvent, useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReceiptFormProps {
  onSuccess?: (receiptId: string) => void;
}

// Device name suggestions
const deviceSuggestions = [
  'Dell Laptop',
  'HP Laptop',
  'Lenovo Laptop',
  'Acer Laptop',
  'Asus Laptop',
  'MacBook',
  'Desktop PC',
  'Dell Monitor',
  'HP Monitor',
  'LG Monitor',
  'HP Printer',
  'Canon Printer',
  'Epson Printer',
  'Motherboard',
  'Gaming Laptop',
  'Workstation',
];

// Device entry type
interface DeviceEntry {
  id: string;
  device_type: string;
  model_number: string;
  serial_number: string;
  problem_description: string;
  has_accessories: boolean;
  accessories_text: string;
  has_password_lock: boolean;
  device_password: string;
}

const createEmptyDevice = (): DeviceEntry => ({
  id: crypto.randomUUID(),
  device_type: '',
  model_number: '',
  serial_number: '',
  problem_description: '',
  has_accessories: false,
  accessories_text: '',
  has_password_lock: false,
  device_password: '',
});

export function ReceiptForm({ onSuccess }: ReceiptFormProps) {
  const createReceipt = useCreateReceipt();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [receivedDate, setReceivedDate] = useState<Date | undefined>(new Date());
  const [devices, setDevices] = useState<DeviceEntry[]>([createEmptyDevice()]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceSuggestions_, setDeviceSuggestions_] = useState<Record<string, string[]>>({});
  const [suggestionOpen, setSuggestionOpen] = useState<Record<string, boolean>>({});
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<Record<string, number>>({});
  const deviceNameInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const deviceKeyboardDebugEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return import.meta.env.DEV || window.localStorage.getItem('debug-device-autocomplete') === '1';
  }, []);

  // Refs for Enter key navigation
  const phoneRef = useRef<HTMLInputElement>(null);
  const deviceRefs = useRef<Record<string, {
    deviceName: HTMLInputElement | null;
    modelNumber: HTMLInputElement | null;
    serialNumber: HTMLInputElement | null;
    problem: HTMLTextAreaElement | null;
    accessories: HTMLInputElement | null;
    password: HTMLInputElement | null;
  }>>({})

  const setDeviceRef = (deviceId: string, field: 'deviceName' | 'modelNumber' | 'serialNumber' | 'problem' | 'accessories' | 'password', el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!deviceRefs.current[deviceId]) {
      deviceRefs.current[deviceId] = { deviceName: null, modelNumber: null, serialNumber: null, problem: null, accessories: null, password: null };
    }
    deviceRefs.current[deviceId][field] = el as any;
  };

  const handleEnterNavigation = (e: KeyboardEvent, nextFocus: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      nextFocus();
    }
  };

  // Ref for submit button
  const submitRef = useRef<HTMLButtonElement>(null);

  const focusNextDevice = (currentIndex: number) => {
    if (currentIndex < devices.length - 1) {
      const nextDevice = devices[currentIndex + 1];
      deviceRefs.current[nextDevice.id]?.deviceName?.focus();
    } else {
      // Last device - focus submit button
      submitRef.current?.focus();
    }
  };

  const handleSelectCustomer = (name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone);
  };

  const updateDevice = (deviceId: string, field: keyof DeviceEntry, value: any) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, [field]: value } : d
    ));
  };

  const handleDeviceNameChange = (deviceId: string, value: string) => {
    updateDevice(deviceId, 'device_type', value);
    if (value.length > 0) {
      const filtered = deviceSuggestions.filter(d =>
        d.toLowerCase().includes(value.toLowerCase())
      );
      setDeviceSuggestions_(prev => ({ ...prev, [deviceId]: filtered }));
      setSuggestionOpen(prev => ({ ...prev, [deviceId]: filtered.length > 0 }));
      setSelectedSuggestionIndex(prev => ({ ...prev, [deviceId]: filtered.length > 0 ? 0 : -1 }));
    } else {
      setSuggestionOpen(prev => ({ ...prev, [deviceId]: false }));
      setSelectedSuggestionIndex(prev => ({ ...prev, [deviceId]: -1 }));
    }
  };

  const selectDeviceSuggestion = (deviceId: string, suggestion: string) => {
    updateDevice(deviceId, 'device_type', suggestion);
    setSuggestionOpen(prev => ({ ...prev, [deviceId]: false }));
    setSelectedSuggestionIndex(prev => ({ ...prev, [deviceId]: -1 }));
  };

  const handleDeviceSuggestionKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    deviceId: string,
    nextFocus: () => void
  ) => {
    // Prevent duplicate handling when multiple key listeners are active.
    if (e.defaultPrevented) {
      return;
    }

    const suggestions = deviceSuggestions_[deviceId] ?? [];
    const isOpen = suggestionOpen[deviceId] && suggestions.length > 0;
    const key = e.key;

    if (deviceKeyboardDebugEnabled && (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === 'Escape')) {
      console.log('[DeviceAutocomplete] keydown', {
        key,
        deviceId,
        isOpen,
        suggestionsCount: suggestions.length,
        selectedIndex: selectedSuggestionIndex[deviceId] ?? -1,
        activeElementIsInput: document.activeElement === e.currentTarget,
      });
    }

    if (key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setSuggestionOpen(prev => ({ ...prev, [deviceId]: true }));
      setSelectedSuggestionIndex(prev => {
        const current = prev[deviceId] ?? -1;
        const next = (current + 1) % suggestions.length;
        return { ...prev, [deviceId]: next };
      });
      // Keep focus anchored on the input for accessible combobox navigation.
      requestAnimationFrame(() => deviceNameInputRefs.current[deviceId]?.focus());
      return;
    }

    if (key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setSuggestionOpen(prev => ({ ...prev, [deviceId]: true }));
      setSelectedSuggestionIndex(prev => {
        const current = prev[deviceId] ?? -1;
        const next = current <= 0 ? suggestions.length - 1 : current - 1;
        return { ...prev, [deviceId]: next };
      });
      requestAnimationFrame(() => deviceNameInputRefs.current[deviceId]?.focus());
      return;
    }

    if (key === 'Enter' && !e.shiftKey) {
      if (isOpen) {
        e.preventDefault();
        const selectedIndex = selectedSuggestionIndex[deviceId] ?? 0;
        const suggestion = suggestions[selectedIndex];
        if (suggestion) {
          selectDeviceSuggestion(deviceId, suggestion);
          requestAnimationFrame(() => deviceNameInputRefs.current[deviceId]?.focus());
        }
        return;
      }
      handleEnterNavigation(e, nextFocus);
      return;
    }

    if (key === 'Escape' && suggestionOpen[deviceId]) {
      e.preventDefault();
      setSuggestionOpen(prev => ({ ...prev, [deviceId]: false }));
      setSelectedSuggestionIndex(prev => ({ ...prev, [deviceId]: -1 }));
    }
  };

  const addDevice = () => {
    if (devices.length < 4) {
      setDevices(prev => [...prev, createEmptyDevice()]);
    }
  };

  const canAddMoreDevices = devices.length < 4;

  const removeDevice = (deviceId: string) => {
    if (devices.length > 1) {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
    }
  };

  const togglePasswordVisibility = (deviceId: string) => {
    setShowPasswords(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Use a single timestamp for all devices in this submission
    const sharedReceivedDate = receivedDate 
      ? receivedDate.toISOString().split('T')[0] // Use date only (YYYY-MM-DD)
      : new Date().toISOString().split('T')[0];

    // Generate a shared group_id for all devices in this receipt
    const sharedGroupId = crypto.randomUUID();

    try {
      let lastResult: any = null;
      for (let i = 0; i < devices.length; i++) {
        const device = devices[i];
        const submitData = {
          customer_name: customerName || '',
          customer_phone: customerPhone || '',
          device_type: device.device_type || '',
          device_model: device.model_number || null,
          serial_number: device.serial_number || null,
          problem_description: device.problem_description || '',
          accessories: device.has_accessories && device.accessories_text ? device.accessories_text : null,
          device_password: device.has_password_lock && device.device_password ? device.device_password : null,
          received_date: sharedReceivedDate,
          group_id: sharedGroupId, // Same group_id for all devices
        };

        lastResult = await createReceipt.mutateAsync(submitData);
      }
      
      // Reset form after all devices created
      setCustomerName('');
      setCustomerPhone('');
      setReceivedDate(new Date());
      setDevices([createEmptyDevice()]);
      setShowPasswords({});
      if (lastResult) {
        onSuccess?.(lastResult.id);
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center py-4 border-b-2 border-primary">
        <h1 className="text-3xl font-bold text-primary tracking-wide">Marktech Nepal</h1>
        <p className="text-muted-foreground italic">Laptop & Computer Repair Center</p>
      </div>

      {/* Customer Information */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <CustomerAutocomplete
                value={customerName}
                onChange={setCustomerName}
                onSelectCustomer={handleSelectCustomer}
                placeholder="Enter customer name"
                onKeyDown={(e) => handleEnterNavigation(e, () => phoneRef.current?.focus())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number</Label>
              <Input
                id="customer_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                ref={phoneRef}
                placeholder="Enter phone number"
                onKeyDown={(e) => handleEnterNavigation(e, () => {
                  const firstDevice = devices[0];
                  if (firstDevice) {
                    deviceRefs.current[firstDevice.id]?.deviceName?.focus();
                  }
                })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Received Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !receivedDate && "text-muted-foreground"
                  )}
                  onKeyDown={(e) => {
                    // Disable Enter key navigation on date field - only allow date picker selection
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {receivedDate ? format(receivedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={receivedDate}
                  onSelect={setReceivedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Device Sections */}
      {devices.map((device, index) => (
        <Card key={device.id} className="shadow-card border-2 border-primary/20">
          <CardHeader className="pb-4 bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Laptop className="w-5 h-5 text-primary" />
                Device {devices.length > 1 ? `#${index + 1}` : 'Details'}
              </CardTitle>
              {devices.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDevice(device.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Device Name with Autocomplete */}
            <div className="space-y-2 relative">
              <Label>Device Name</Label>
              <Input
                ref={(el) => {
                  setDeviceRef(device.id, 'deviceName', el);
                  deviceNameInputRefs.current[device.id] = el;
                }}
                value={device.device_type}
                onChange={(e) => handleDeviceNameChange(device.id, e.target.value)}
                placeholder="e.g., Dell Laptop, HP Printer"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={Boolean(suggestionOpen[device.id] && (deviceSuggestions_[device.id]?.length ?? 0) > 0)}
                aria-controls={`device-suggestions-${device.id}`}
                aria-activedescendant={
                  suggestionOpen[device.id] &&
                  (selectedSuggestionIndex[device.id] ?? -1) >= 0
                    ? `device-suggestion-${device.id}-${selectedSuggestionIndex[device.id]}`
                    : undefined
                }
                onBlur={() => {
                  setTimeout(() => {
                    setSuggestionOpen(prev => ({ ...prev, [device.id]: false }));
                    setSelectedSuggestionIndex(prev => ({ ...prev, [device.id]: -1 }));
                  }, 150);
                }}
                autoComplete="off"
                onKeyDownCapture={(e) =>
                  handleDeviceSuggestionKeyDown(e, device.id, () => {
                    deviceRefs.current[device.id]?.modelNumber?.focus();
                  })
                }
                onKeyDown={(e) =>
                  handleDeviceSuggestionKeyDown(e, device.id, () => {
                    deviceRefs.current[device.id]?.modelNumber?.focus();
                  })
                }
              />
              {suggestionOpen[device.id] && (deviceSuggestions_[device.id]?.length ?? 0) > 0 && (
                <div
                  id={`device-suggestions-${device.id}`}
                  role="listbox"
                  className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto"
                >
                  {deviceSuggestions_[device.id].map((suggestion, idx) => (
                    <button
                      key={idx}
                      id={`device-suggestion-${device.id}-${idx}`}
                      role="option"
                      aria-selected={(selectedSuggestionIndex[device.id] ?? -1) === idx}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        (selectedSuggestionIndex[device.id] ?? -1) === idx
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      onMouseEnter={() =>
                        setSelectedSuggestionIndex(prev => ({ ...prev, [device.id]: idx }))
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectDeviceSuggestion(device.id, suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Number & Serial Number */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Model Number</Label>
                <Input
                  ref={(el) => setDeviceRef(device.id, 'modelNumber', el)}
                  value={device.model_number}
                  onChange={(e) => updateDevice(device.id, 'model_number', e.target.value)}
                  placeholder="Enter model number"
                  onKeyDown={(e) => handleEnterNavigation(e, () => {
                    deviceRefs.current[device.id]?.serialNumber?.focus();
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  ref={(el) => setDeviceRef(device.id, 'serialNumber', el)}
                  value={device.serial_number}
                  onChange={(e) => updateDevice(device.id, 'serial_number', e.target.value)}
                  placeholder="Enter serial number"
                  onKeyDown={(e) => handleEnterNavigation(e, () => {
                    deviceRefs.current[device.id]?.problem?.focus();
                  })}
                />
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <Label>Problem Description</Label>
              <Textarea
                ref={(el) => setDeviceRef(device.id, 'problem', el)}
                value={device.problem_description}
                onChange={(e) => updateDevice(device.id, 'problem_description', e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                    e.preventDefault();
                    deviceRefs.current[device.id]?.accessories?.focus();
                  }
                }}
              />
            </div>

            {/* Accessories: Checkbox + Text Input (only shows when checked) */}
            <div className="space-y-3 py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`accessories-${device.id}`}
                  checked={device.has_accessories}
                  onCheckedChange={(checked) => updateDevice(device.id, 'has_accessories', checked === true)}
                />
                <Label htmlFor={`accessories-${device.id}`} className="text-sm font-medium cursor-pointer">
                  Accessories
                </Label>
              </div>
              {device.has_accessories && (
                <Input
                  ref={(el) => setDeviceRef(device.id, 'accessories', el)}
                  value={device.accessories_text}
                  onChange={(e) => updateDevice(device.id, 'accessories_text', e.target.value)}
                  placeholder="e.g., Charger, Bag, Mouse"
                  onKeyDown={(e) => handleEnterNavigation(e, () => {
                    deviceRefs.current[device.id]?.password?.focus();
                  })}
                />
              )}
            </div>

            {/* Password Lock: Checkbox + Text Input (only shows when checked) */}
            <div className="space-y-3 py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`lock-${device.id}`}
                  checked={device.has_password_lock}
                  onCheckedChange={(checked) => updateDevice(device.id, 'has_password_lock', checked === true)}
                />
                <Label htmlFor={`lock-${device.id}`} className="text-sm font-medium cursor-pointer">
                  Password Lock
                </Label>
              </div>
              {device.has_password_lock && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={(el) => setDeviceRef(device.id, 'password', el)}
                      type={showPasswords[device.id] ? 'text' : 'password'}
                      value={device.device_password}
                      onChange={(e) => updateDevice(device.id, 'device_password', e.target.value)}
                      placeholder="Enter device password"
                      className="pr-10"
                      onKeyDown={(e) => handleEnterNavigation(e, () => {
                        focusNextDevice(index);
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => togglePasswordVisibility(device.id)}
                    >
                      {showPasswords[device.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`show-pwd-${device.id}`}
                      checked={showPasswords[device.id] || false}
                      onCheckedChange={(checked) => setShowPasswords(prev => ({ ...prev, [device.id]: checked === true }))}
                    />
                    <Label htmlFor={`show-pwd-${device.id}`} className="text-xs cursor-pointer whitespace-nowrap">
                      Show
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Next Device & Submit */}
      <Card className="shadow-card border border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={addDevice}
                disabled={!canAddMoreDevices}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Next Device
              </Button>
              {!canAddMoreDevices && (
                <span className="text-sm text-muted-foreground">
                  Maximum 4 devices per receipt
                </span>
              )}
              {canAddMoreDevices && devices.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {devices.length}/4 devices
                </span>
              )}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting} ref={submitRef}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {devices.length > 1 ? `Create ${devices.length} Receipts` : 'Create Receipt'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
