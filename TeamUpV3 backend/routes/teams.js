const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    let query = supabase
      .from('teams')
      .select(`
        *,
        created_by_profile:profiles!teams_created_by_fkey(id, full_name, email),
        team_members(
          id,
          joined_at,
          user:profiles(id, full_name, email, role, skills)
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      teams: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get teams by user (created by user)
router.get('/my-teams/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          joined_at,
          user:profiles(id, full_name, email, role, skills)
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      teams: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get single team
router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        created_by_profile:profiles!teams_created_by_fkey(id, full_name, email),
        team_members(
          id,
          joined_at,
          user:profiles(id, full_name, email, role, skills, interests, description)
        )
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      team: data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// Create team
router.post('/', async (req, res) => {
  try {
    const teamData = req.body;

    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      team: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Update team
router.put('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      team: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete team
router.delete('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Add member to team
router.post('/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role: role || 'Member',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      member: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Remove member from team
router.delete('/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', memberId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Search teams
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          user:profiles(id, full_name)
        )
      `)
      .eq('status', 'active')
      .or(`team_name.ilike.%${query}%,description.ilike.%${query}%,project_type.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      teams: data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
