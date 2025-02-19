async function getMetadata(req, res) {
  const Metadata = req.db.Metadata;
  try {
    const metadata = await Metadata.findOne({
      attributes: ['id', 'name', 'table_num', 'hostname'],
    });

    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getMetadata,
};