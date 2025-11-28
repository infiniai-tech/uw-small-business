import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, AlertCircle } from 'lucide-react'

const AddRuleModal = ({ isOpen, onClose, onSave, isLoading, parentRules = [], error }) => {
  const [formData, setFormData] = React.useState({
    rule_id: '',
    name: '',
    expected: '',
    description: '',
    parent_rule_id: '' // Empty means top-level rule
  })
  
  const [validationErrors, setValidationErrors] = React.useState({})

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        rule_id: '',
        name: '',
        expected: '',
        description: '',
        parent_rule_id: ''
      })
      setValidationErrors({})
    }
  }, [isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.rule_id.trim()) {
      errors.rule_id = 'Rule ID is required'
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Rule name is required'
    }
    
    if (!formData.expected.trim()) {
      errors.expected = 'Expected value is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  // Generate suggested rule ID based on parent
  const generateSuggestedId = () => {
    if (formData.parent_rule_id) {
      // Find parent rule to determine next sub-rule number
      const parent = parentRules.find(r => r.id === formData.parent_rule_id)
      if (parent) {
        const existingSubRules = parent.dependencies?.length || 0
        return `${formData.parent_rule_id}.${existingSubRules + 1}`
      }
    }
    // For top-level rules, suggest next number
    const topLevelCount = parentRules.length
    return `${topLevelCount + 1}`
  }

  const handleParentChange = (value) => {
    const parentId = value === 'none' ? '' : value
    handleChange('parent_rule_id', parentId)
    
    // Auto-suggest rule ID based on parent
    if (parentId) {
      const parent = parentRules.find(r => r.id === parentId)
      if (parent) {
        const existingSubRules = parent.dependencies?.length || 0
        handleChange('rule_id', `${parentId}.${existingSubRules + 1}`)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]" style={{
        background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(254, 243, 226, 0.95) 100%)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{
            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <Plus className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
            Add New Rule
          </DialogTitle>
          <DialogDescription className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            Create a new rule or sub-rule for this policy
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div 
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626'
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Parent Rule Selection */}
          <div className="space-y-2">
            <Label htmlFor="parent_rule" className="text-sm font-semibold">
              Parent Rule <span className="text-xs font-normal" style={{ color: 'hsl(var(--color-muted-foreground))' }}>(optional - leave empty for top-level rule)</span>
            </Label>
            <Select
              value={formData.parent_rule_id || 'none'}
              onValueChange={handleParentChange}
            >
              <SelectTrigger 
                className="border-2"
                style={{
                  borderColor: 'rgba(250, 129, 47, 0.3)',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                <SelectValue placeholder="Select parent rule (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
                      background: 'rgba(147, 51, 234, 0.1)', 
                      color: '#9333ea' 
                    }}>
                      Top-Level
                    </span>
                    No parent (create as main rule)
                  </span>
                </SelectItem>
                {parentRules.map(rule => (
                  <SelectItem key={rule.id} value={rule.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ 
                        background: 'rgba(250, 129, 47, 0.1)', 
                        color: 'hsl(var(--color-primary))' 
                      }}>
                        {rule.id}
                      </span>
                      {rule.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rule ID */}
          <div className="space-y-2">
            <Label htmlFor="rule_id" className="text-sm font-semibold">
              Rule ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rule_id"
              value={formData.rule_id}
              onChange={(e) => handleChange('rule_id', e.target.value)}
              placeholder={generateSuggestedId() ? `e.g., ${generateSuggestedId()}` : "e.g., 1.1 or 2.3.1"}
              className={`border-2 font-mono ${validationErrors.rule_id ? 'border-red-400' : ''}`}
              style={{
                borderColor: validationErrors.rule_id ? undefined : 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
            {validationErrors.rule_id && (
              <p className="text-xs text-red-500">{validationErrors.rule_id}</p>
            )}
          </div>

          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Rule Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Age Requirement Check"
              className={`border-2 ${validationErrors.name ? 'border-red-400' : ''}`}
              style={{
                borderColor: validationErrors.name ? undefined : 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
            {validationErrors.name && (
              <p className="text-xs text-red-500">{validationErrors.name}</p>
            )}
          </div>

          {/* Expected Value */}
          <div className="space-y-2">
            <Label htmlFor="expected" className="text-sm font-semibold">
              Expected Value <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expected"
              value={formData.expected}
              onChange={(e) => handleChange('expected', e.target.value)}
              placeholder="e.g., Age >= 18 and Age <= 65"
              className={`border-2 ${validationErrors.expected ? 'border-red-400' : ''}`}
              style={{
                borderColor: validationErrors.expected ? undefined : 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
            {validationErrors.expected && (
              <p className="text-xs text-red-500">{validationErrors.expected}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this rule checks and validates..."
              rows={3}
              className={`border-2 resize-none ${validationErrors.description ? 'border-red-400' : ''}`}
              style={{
                borderColor: validationErrors.description ? undefined : 'rgba(250, 129, 47, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
            />
            {validationErrors.description && (
              <p className="text-xs text-red-500">{validationErrors.description}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
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
                  Adding Rule...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddRuleModal

