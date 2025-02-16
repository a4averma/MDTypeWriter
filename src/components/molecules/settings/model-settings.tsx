import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

interface ModelKeys {
  openai?: string;
  anthropic?: string;
  cohere?: string;
  deepseek?: string;
}

interface ModelSettings {
  apiKeys: ModelKeys;
  enabledModels: {
    openai: boolean;
    anthropic: boolean;
    cohere: boolean;
    deepseek: boolean;
  };
}

export function ModelsSettings() {
  const [settings, setSettings] = useState<ModelSettings>({
    apiKeys: {},
    enabledModels: {
      openai: false,
      anthropic: false,
      cohere: false,
      deepseek: false,
    },
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("mdtw-model-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("mdtw-model-settings", JSON.stringify(settings));
    // Keep the old key for backward compatibility
    localStorage.setItem("mdtw-api-keys", JSON.stringify(settings.apiKeys));
  };

  return (
    <div className="p-6 overflow-auto">
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
          <CardDescription>
            Configure your API keys and enable/disable AI providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <Label htmlFor="openai">OpenAI</Label>
                <p className="text-sm text-muted-foreground">
                  Enable GPT-3.5 and GPT-4 models
                </p>
              </div>
              <Switch
                checked={settings.enabledModels.openai}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enabledModels: {
                      ...settings.enabledModels,
                      openai: checked,
                    },
                  })
                }
              />
            </div>
            {settings.enabledModels.openai && (
              <Input
                id="openai"
                type="password"
                value={settings.apiKeys.openai || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, openai: e.target.value },
                  })
                }
                placeholder="sk-..."
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <Label htmlFor="anthropic">Anthropic</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Claude models
                </p>
              </div>
              <Switch
                checked={settings.enabledModels.anthropic}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enabledModels: {
                      ...settings.enabledModels,
                      anthropic: checked,
                    },
                  })
                }
              />
            </div>
            {settings.enabledModels.anthropic && (
              <Input
                id="anthropic"
                type="password"
                value={settings.apiKeys.anthropic || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, anthropic: e.target.value },
                  })
                }
                placeholder="sk-ant-..."
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <Label htmlFor="cohere">Cohere</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Command model
                </p>
              </div>
              <Switch
                checked={settings.enabledModels.cohere}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enabledModels: {
                      ...settings.enabledModels,
                      cohere: checked,
                    },
                  })
                }
              />
            </div>
            {settings.enabledModels.cohere && (
              <Input
                id="cohere"
                type="password"
                value={settings.apiKeys.cohere || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, cohere: e.target.value },
                  })
                }
                placeholder="..."
              />
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <Label htmlFor="deepseek">DeepSeek</Label>
                <p className="text-sm text-muted-foreground">
                  Enable DeepSeek model
                </p>
              </div>
              <Switch
                checked={settings.enabledModels.cohere}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enabledModels: {
                      ...settings.enabledModels,
                      deepseek: checked,
                    },
                  })
                }
              />
            </div>
            {settings.enabledModels.deepseek && (
              <Input
                id="deepseek"
                type="password"
                value={settings.apiKeys.deepseek || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, deepseek: e.target.value },
                  })
                }
                placeholder="..."
              />
            )}
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
