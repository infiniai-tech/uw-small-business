import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

const EditRuleModal = ({ isOpen, onClose, rule, onSave, isLoading }) => {
  const [formData, setFormData] = React.useState({
    rule_id: '',
    name: '',
    expected: '',
    description: ''
  })

  // Initialize form when rule changes
  React.useEffect(() => {
    if (rule) {
      setFormData({
        rule_id: rule.id || rule.rule_id || '',
        name: rule.name || rule.rule_name || '',
        expected: rule.expected || '',
        description: rule.description || rule.requirement || ''
      })
    } else {
      // Reset form when no rule is selected
      setFormData({
        rule_id: '',
        name: '',
        expected: '',
        description: ''
      })
    }
  }, [rule])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" style={{
        background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(254, 243, 226, 0.95) 100%)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Edit Rule
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Rule ID */}
          <div className="space-y-2">
            <Label htmlFor="rule_id" className="text-sm font-semibold">
              Rule ID
            </Label>
            <Input
              id="rule_id"
              value={formData.rule_id}
              readOnly
              disabled
              className="border-2 cursor-not-allowed"
              style={{
                borderColor: 'rgba(250, 129, 47, 0.2)',
                background: 'rgba(250, 129, 47, 0.05)',
                color: 'hsl(var(--color-muted-foreground))'
              }}
            />
          </div>

          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Rule Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Age Check Rule"
              className="border-2"
              style={{
                borderColor: 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
          </div>

          {/* Expected Value */}
          <div className="space-y-2">
            <Label htmlFor="expected" className="text-sm font-semibold">
              Expected Value
            </Label>
            <Input
              id="expected"
              value={formData.expected}
              onChange={(e) => handleChange('expected', e.target.value)}
              placeholder="e.g., Age >= 18"
              className="border-2"
              style={{
                borderColor: 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter rule description..."
              rows={3}
              className="border-2 resize-none"
              style={{
                borderColor: 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-2"
              style={{
                borderColor: 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                border: 'none'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Rule'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditRuleModal

