import React from 'react';
import { Card, CardContent, Chip, Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

/**
 * LocationCard Component
 * 
 * Displays a single trial location with facility, contact info, and status badge.
 * 
 * @param {Object} props
 * @param {Object} props.location - Location data object
 * @param {string} props.location.facility - Facility name
 * @param {string} props.location.city - City name
 * @param {string} props.location.state - Two-letter state code
 * @param {string} props.location.zip - ZIP code
 * @param {string} [props.location.status] - Location status (RECRUITING, NOT_YET_RECRUITING, etc.)
 * @param {string} [props.location.contact_name] - Contact person name
 * @param {string} [props.location.contact_phone] - Contact phone number
 * @param {string} [props.location.contact_email] - Contact email address
 */
const LocationCard = ({ location }) => {
  if (!location) return null;

  const { 
    facility, 
    city, 
    state, 
    zip, 
    status, 
    contact_name, 
    contact_phone, 
    contact_email 
  } = location;

  // Determine status badge color
  const getStatusColor = (status) => {
    if (!status) return 'default';
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'RECRUITING') return 'success'; // Green
    if (upperStatus === 'NOT_YET_RECRUITING') return 'warning'; // Orange
    return 'default'; // Gray
  };

  return (
    <Card 
      sx={{ 
        mb: 1.5, 
        backgroundColor: '#f5f5f5',
        borderRadius: 2
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Facility Name */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {facility || 'Unknown Facility'}
        </Typography>

        {/* Location Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {city}{city && state ? ', ' : ''}{state} {zip}
          </Typography>
        </Box>

        {/* Status Badge */}
        {status && (
          <Chip 
            label={status}
            color={getStatusColor(status)}
            size="small"
            sx={{ mb: 1 }}
          />
        )}

        {/* Contact Information */}
        {(contact_phone || contact_email || contact_name) && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
            {contact_name && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Contact: {contact_name}
              </Typography>
            )}
            {contact_phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {contact_phone}
                </Typography>
              </Box>
            )}
            {contact_email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {contact_email}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationCard;

